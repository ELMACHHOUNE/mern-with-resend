const EmailThread = require("../models/EmailThread");
const EmailMessage = require("../models/EmailMessage");

function normalizeSubject(subject) {
  if (!subject) return "";
  return subject
    .replace(/^(Re|Fw|Fwd|回复|转发|RE|FW|FWD|R|AW|SV|ΑΠ|Σχέτ|TR|VS|ODP|RIF| riferimento|enc|EDV)：?\s*[:-]?\s*/g, "")
    .replace(/^(Re|Fw|Fwd):\s*/gi, "")
    .trim();
}

function getMessageIdFromHeaders(headers) {
  if (!headers) return null;
  return headers["message-id"] || headers["messageId"] || headers["Message-ID"] || headers["Message-Id"] || null;
}

function getInReplyToFromHeaders(headers) {
  if (!headers) return null;
  return headers["in-reply-to"] || headers["inReplyTo"] || headers["In-Reply-To"] || null;
}

function getReferencesFromHeaders(headers) {
  if (!headers) return null;
  const refs = headers["references"] || headers["References"] || null;
  if (!refs) return null;
  return refs
    .split(/\s+/)
    .filter(Boolean)
    .map((r) => r.replace(/^<?|>?$/g, ""));
}

async function resolveThread({ subject, from, to, headers }) {
  const inReplyTo = getInReplyToFromHeaders(headers);
  const references = getReferencesFromHeaders(headers);
  const messageId = getMessageIdFromHeaders(headers);

  const allRefs = [];
  if (inReplyTo) allRefs.push(inReplyTo.replace(/^<?|>?$/g, ""));
  if (references) allRefs.push(...references);

  if (allRefs.length > 0) {
    const parentMessage = await EmailMessage.findOne({
      "headers.messageId": { $in: allRefs },
    });

    if (parentMessage) {
      const thread = await EmailThread.findById(parentMessage.threadId);
      if (thread) {
        return { thread, isNew: false };
      }
    }
  }

  const normalizedSubject = normalizeSubject(subject);
  const allParticipants = [from, ...(to || [])].filter(Boolean).map((e) => e.toLowerCase().trim());
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  if (normalizedSubject) {
    const existingThread = await EmailThread.findOne({
      lastMessageAt: { $gte: thirtyDaysAgo },
      subject: { $regex: new RegExp(`^${escapeRegex(normalizedSubject)}$`, "i") },
      participants: { $in: allParticipants },
    });

    if (existingThread) {
      return { thread: existingThread, isNew: false };
    }
  }

  const newThread = await EmailThread.create({
    subject: normalizedSubject || subject || "(no subject)",
    participants: [...new Set(allParticipants)],
    lastMessageAt: new Date(),
    messageCount: 0,
  });

  return { thread: newThread, isNew: true };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function createOrUpdateThread(thread, message, direction) {
  const allParticipants = [message.from, ...(message.to || []), ...(message.cc || [])]
    .filter(Boolean)
    .map((e) => e.toLowerCase().trim());

  thread.participants = [...new Set([...thread.participants, ...allParticipants])];
  thread.lastMessageAt = new Date();
  thread.messageCount = (thread.messageCount || 0) + 1;

  if (direction === "inbound") {
    thread.isRead = false;
    if (thread.folder !== "trash" && thread.folder !== "spam") {
      thread.folder = "inbox";
    }
  }

  await thread.save();
  return thread;
}

module.exports = {
  resolveThread,
  createOrUpdateThread,
  normalizeSubject,
  getMessageIdFromHeaders,
};
