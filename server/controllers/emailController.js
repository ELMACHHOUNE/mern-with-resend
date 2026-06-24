const { Resend } = require("resend");
const { z } = require("zod");
const EmailMessage = require("../models/EmailMessage");
const EmailThread = require("../models/EmailThread");
const { resolveThread, createOrUpdateThread, normalizeSubject, getMessageIdFromHeaders } = require("../services/emailProcessor");

const resend = new Resend(process.env.RESEND_API_KEY);
const INBOX_EMAIL = process.env.INBOX_EMAIL_ADDRESS || "admin@3d-maghribi.com";

const sendSchema = z.object({
  to: z.array(z.string().email()).min(1, "At least one recipient required"),
  cc: z.array(z.string().email()).optional().default([]),
  bcc: z.array(z.string().email()).optional().default([]),
  subject: z.string().min(1, "Subject is required").max(998, "Subject too long"),
  html: z.string().optional(),
  text: z.string().optional(),
  threadId: z.string().optional(),
  inReplyTo: z.string().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string().min(1),
        content: z.string().min(1),
      })
    )
    .optional()
    .default([]),
}).refine((data) => data.html || data.text, {
  message: "Either html or text content is required",
});

const draftSchema = z.object({
  to: z.array(z.string().email()).optional().default([]),
  cc: z.array(z.string().email()).optional().default([]),
  bcc: z.array(z.string().email()).optional().default([]),
  subject: z.string().max(998).optional().default(""),
  html: z.string().optional(),
  text: z.string().optional(),
  threadId: z.string().optional(),
});

const sendEmail = async (req, res) => {
  try {
    const parsed = sendSchema.parse(req.body);

    const subject = parsed.subject;
    const from = `Admin <${INBOX_EMAIL}>`;

    const resendPayload = {
      from,
      to: parsed.to,
      subject,
      ...(parsed.html && { html: parsed.html }),
      ...(parsed.text && { text: parsed.text }),
    };

    if (parsed.cc.length > 0) {
      resendPayload.cc = parsed.cc;
    }
    if (parsed.bcc.length > 0) {
      resendPayload.bcc = parsed.bcc;
    }

    if (parsed.attachments.length > 0) {
      resendPayload.attachments = parsed.attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      }));
    }

    let thread = null;
    if (parsed.threadId) {
      thread = await EmailThread.findById(parsed.threadId);
    }

    if (parsed.inReplyTo && thread) {
      const parentMsg = await EmailMessage.findOne({
        threadId: thread._id,
        "headers.messageId": parsed.inReplyTo,
      });
      if (parentMsg && parentMsg.headers?.messageId) {
        const existingRefs = parentMsg.headers?.references || [];
        resendPayload.headers = {
          "In-Reply-To": `<${parentMsg.headers.messageId}>`,
          "References": [...existingRefs, parentMsg.headers.messageId]
            .map((r) => (r.startsWith("<") ? r : `<${r}>`))
            .join(" "),
        };
      }
    }

    const { data, error } = await resend.emails.send(resendPayload);

    if (error) {
      return res.status(400).json({ message: error.message || "Failed to send email" });
    }

    const outboundMessageId = data?.id || `${Date.now()}-${Math.random().toString(36)}`;

    if (!thread) {
      const result = await resolveThread({
        subject,
        from: INBOX_EMAIL,
        to: parsed.to,
        headers: { "message-id": outboundMessageId },
      });
      thread = result.thread;
    }

    const message = await EmailMessage.create({
      threadId: thread._id,
      resendId: outboundMessageId,
      direction: "outbound",
      from: INBOX_EMAIL,
      to: parsed.to,
      cc: parsed.cc,
      bcc: parsed.bcc,
      subject,
      html: parsed.html || "",
      text: parsed.text || "",
      headers: {
        messageId: outboundMessageId,
        inReplyTo: parsed.inReplyTo || "",
        references: parsed.inReplyTo ? [parsed.inReplyTo] : [],
      },
      attachments: parsed.attachments.map((a) => ({
        filename: a.filename,
        contentType: "application/octet-stream",
        size: Math.ceil((a.content?.length || 0) * 0.75),
      })),
      status: "sent",
      isRead: true,
    });

    await createOrUpdateThread(
      thread,
      { from: INBOX_EMAIL, to: parsed.to, cc: parsed.cc },
      "outbound"
    );

    thread.folder = "sent";
    thread.isRead = true;
    await thread.save();

    res.status(200).json({
      message: "Email sent successfully",
      data: {
        thread,
        message,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: err.errors });
    }
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const saveDraft = async (req, res) => {
  try {
    const parsed = draftSchema.parse(req.body);

    const thread = await EmailThread.create({
      subject: normalizeSubject(parsed.subject || "(no subject)"),
      participants: [...new Set([...(parsed.to || []), ...(parsed.cc || []), ...(parsed.bcc || [])].filter(Boolean).map((e) => e.toLowerCase().trim()))],
      folder: "drafts",
      isRead: true,
      messageCount: 1,
      lastMessageAt: new Date(),
    });

    const message = await EmailMessage.create({
      threadId: thread._id,
      direction: "outbound",
      from: INBOX_EMAIL,
      to: parsed.to,
      cc: parsed.cc,
      bcc: parsed.bcc,
      subject: parsed.subject || "",
      html: parsed.html || "",
      text: parsed.text || "",
      status: "received",
      isRead: true,
    });

    res.status(201).json({ thread, message });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: err.errors });
    }
    console.error("Error saving draft:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = draftSchema.parse(req.body);

    const message = await EmailMessage.findById(id).populate("threadId");
    if (!message) {
      return res.status(404).json({ message: "Draft not found" });
    }

    if (message.direction !== "outbound" || message.threadId?.folder !== "drafts") {
      return res.status(400).json({ message: "Message is not a draft" });
    }

    const thread = message.threadId;

    if (parsed.to !== undefined) {
      message.to = parsed.to;
      thread.participants = [...new Set([...(parsed.to || []), ...(parsed.cc || []), ...(parsed.bcc || [])].filter(Boolean).map((e) => e.toLowerCase().trim()))];
    }
    if (parsed.cc !== undefined) message.cc = parsed.cc;
    if (parsed.bcc !== undefined) message.bcc = parsed.bcc;
    if (parsed.subject !== undefined) {
      message.subject = parsed.subject;
      thread.subject = normalizeSubject(parsed.subject || "(no subject)");
    }
    if (parsed.html !== undefined) message.html = parsed.html;
    if (parsed.text !== undefined) message.text = parsed.text;

    await message.save();
    await thread.save();

    res.status(200).json({ thread, message });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: err.errors });
    }
    console.error("Error updating draft:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { sendEmail, saveDraft, updateDraft };
