const { Resend } = require("resend");
const EmailMessage = require("../models/EmailMessage");
const EmailThread = require("../models/EmailThread");
const { resolveThread, createOrUpdateThread, getMessageIdFromHeaders } = require("../services/emailProcessor");

const resend = new Resend(process.env.RESEND_API_KEY);

let io = null;
function setSocketIO(socketInstance) {
  io = socketInstance;
}

const inboundWebhook = async (req, res) => {
  try {
    const signingSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (signingSecret) {
      try {
        const rawBody = req.rawBody || JSON.stringify(req.body);
        console.log("[WEBHOOK] Verification debug: hasRawBody=", !!req.rawBody, "rawBodyLength=", rawBody?.length, "hasHeaders.webhook-id=", !!req.headers["webhook-id"]);
        const h = req.headers;
        const { error: sigError } = await resend.webhooks.verify({
          webhookSecret: signingSecret,
          payload: rawBody,
          headers: {
            id: h["webhook-id"],
            timestamp: h["webhook-timestamp"],
            signature: h["webhook-signature"],
          },
        });

        if (sigError) {
          console.error("[WEBHOOK] Signature verification failed:", sigError.message);
          return res.status(401).send("Signature verification failed");
        }
      } catch (verifyErr) {
        console.error("[WEBHOOK] Signature verification threw:", verifyErr.message, "rawBody length:", rawBody?.length, "hasHeaders:", !!h["webhook-id"], !!h["webhook-timestamp"], !!h["webhook-signature"]);
        return res.status(401).send(`Signature verification error: ${verifyErr.message}`);
      }
    } else {
      console.warn("[WEBHOOK] RESEND_WEBHOOK_SECRET not set - skipping signature verification");
    }

    const { type, data } = req.body;

    if (type !== "email.received" || !data) {
      console.log("[WEBHOOK] Ignored non-email-received event:", type);
      return res.status(200).send("OK");
    }

    const emailId = data.email_id || data.id;
    if (!emailId) {
      console.warn("[WEBHOOK] No email_id in payload");
      return res.status(200).send("OK");
    }

    const existing = await EmailMessage.findOne({ resendId: emailId });
    if (existing) {
      console.log("[WEBHOOK] Duplicate email (already processed):", emailId);
      return res.status(200).send("OK");
    }

    const from = data.from || "";
    const to = Array.isArray(data.to) ? data.to : data.to ? [data.to] : [];
    const cc = Array.isArray(data.cc) ? data.cc : data.cc ? [data.cc] : [];
    const subject = data.subject || "(no subject)";
    const html = data.html || "";
    const text = data.text || "";
    const headers = data.headers || {};

    const rawAttachments = Array.isArray(data.attachments) ? data.attachments : [];
    const attachments = rawAttachments.map((att) => ({
      filename: att.filename || "unnamed",
      contentType: att.content_type || att.contentType || "application/octet-stream",
      size: att.size || 0,
      resendAttachmentId: att.id || "",
    }));

    const messageId = getMessageIdFromHeaders(headers) || emailId;

    const { thread } = await resolveThread({
      subject,
      from,
      to,
      headers: {
        ...headers,
        "message-id": messageId,
      },
    });

    const inReplyTo = headers["in-reply-to"] || headers["inReplyTo"] || "";
    const rawReferences = headers["references"] || headers["References"] || "";
    const references = rawReferences
      ? rawReferences.split(/\s+/).filter(Boolean)
      : [];

    const message = await EmailMessage.create({
      threadId: thread._id,
      resendId: emailId,
      direction: "inbound",
      from,
      to,
      cc,
      subject,
      html,
      text,
      headers: {
        messageId,
        inReplyTo: inReplyTo.replace(/^<?|>?$/g, ""),
        references: references.map((r) => r.replace(/^<?|>?$/g, "")),
      },
      attachments,
      status: "received",
      isRead: false,
    });

    await createOrUpdateThread(thread, { from, to, cc }, "inbound");

    console.log("[WEBHOOK] Processed email:", emailId, "thread:", thread._id, "subject:", subject);

    if (io) {
      const updatedThread = await EmailThread.findById(thread._id).lean();
      io.emit("new_email", {
        thread: updatedThread,
        message: {
          _id: message._id,
          from: message.from,
          subject: message.subject,
          text: message.text?.substring(0, 200),
          createdAt: message.createdAt,
        },
      });
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("[WEBHOOK ERROR] Failed to process inbound email:", err.message, err.stack);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = { inboundWebhook, setSocketIO };
