const EmailThread = require("../models/EmailThread");
const EmailMessage = require("../models/EmailMessage");

const listThreads = async (req, res) => {
  try {
    const { folder = "inbox", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = { folder };
    if (folder === "sent") {
      filter.folder = "sent";
    }

    const [threads, total] = await Promise.all([
      EmailThread.find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      EmailThread.countDocuments(filter),
    ]);

    const threadIds = threads.map((t) => t._id);
    const latestMessages = await EmailMessage.aggregate([
      { $match: { threadId: { $in: threadIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$threadId", latest: { $first: "$$ROOT" } } },
    ]);

    const latestMap = {};
    for (const entry of latestMessages) {
      latestMap[entry._id.toString()] = entry.latest;
    }

    const enriched = threads.map((thread) => {
      const latest = latestMap[thread._id.toString()];
      return {
        ...thread,
        latestMessage: latest
          ? {
              _id: latest._id,
              from: latest.from,
              subject: latest.subject,
              text: latest.text?.substring(0, 200),
              createdAt: latest.createdAt,
              direction: latest.direction,
            }
          : null,
      };
    });

    res.status(200).json({
      threads: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Error listing threads:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const searchThreads = async (req, res) => {
  try {
    const { q, folder } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const messageFilter = {
      $text: { $search: q },
    };

    const messages = await EmailMessage.find(messageFilter, {
      score: { $meta: "textScore" },
    })
      .sort({ score: { $meta: "textScore" } })
      .limit(50)
      .lean();

    const threadIds = [...new Set(messages.map((m) => m.threadId.toString()))];

    const threadFilter = { _id: { $in: threadIds } };
    if (folder) {
      threadFilter.folder = folder;
    }

    const threads = await EmailThread.find(threadFilter)
      .sort({ lastMessageAt: -1 })
      .lean();

    const latestMessages = await EmailMessage.aggregate([
      { $match: { threadId: { $in: threads.map((t) => t._id) } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$threadId", latest: { $first: "$$ROOT" } } },
    ]);

    const latestMap = {};
    for (const entry of latestMessages) {
      latestMap[entry._id.toString()] = entry.latest;
    }

    const enriched = threads.map((thread) => ({
      ...thread,
      latestMessage: latestMap[thread._id.toString()]
        ? {
            _id: latestMap[thread._id.toString()]._id,
            from: latestMap[thread._id.toString()].from,
            subject: latestMap[thread._id.toString()].subject,
            text: latestMap[thread._id.toString()].text?.substring(0, 200),
            createdAt: latestMap[thread._id.toString()].createdAt,
            direction: latestMap[thread._id.toString()].direction,
          }
        : null,
    }));

    res.status(200).json({ threads: enriched });
  } catch (err) {
    console.error("Error searching threads:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getThread = async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await EmailThread.findById(threadId).lean();
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const messages = await EmailMessage.find({ threadId })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ thread, messages });
  } catch (err) {
    console.error("Error getting thread:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const updates = req.body;

    const allowedFields = ["isRead", "isStarred", "folder", "labels"];
    const filteredUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const thread = await EmailThread.findByIdAndUpdate(threadId, filteredUpdates, {
      new: true,
    });

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    if (updates.isRead !== undefined) {
      await EmailMessage.updateMany(
        { threadId },
        { isRead: updates.isRead }
      );
    }

    const populated = await EmailMessage.find({ threadId })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();

    res.status(200).json({
      thread,
      latestMessage: populated[0]
        ? {
            _id: populated[0]._id,
            from: populated[0].from,
            subject: populated[0].subject,
            text: populated[0].text?.substring(0, 200),
            createdAt: populated[0].createdAt,
          }
        : null,
    });
  } catch (err) {
    console.error("Error updating thread:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteThread = async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await EmailThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    if (thread.folder === "trash") {
      await EmailMessage.deleteMany({ threadId });
      await EmailThread.findByIdAndDelete(threadId);
      return res.status(200).json({ message: "Thread permanently deleted" });
    }

    thread.folder = "trash";
    await thread.save();

    res.status(200).json({ message: "Thread moved to trash", thread });
  } catch (err) {
    console.error("Error deleting thread:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAttachment = async (req, res) => {
  try {
    const { messageId, attachmentId } = req.params;

    const message = await EmailMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const attachment = message.attachments.find(
      (a) => a.resendAttachmentId === attachmentId || a._id?.toString() === attachmentId
    );

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    if (attachment.resendAttachmentId) {
      const apiKey = process.env.RESEND_API_KEY;
      const response = await fetch(
        `https://api.resend.com/attachments/${attachment.resendAttachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!response.ok) {
        return res.status(502).json({ message: "Failed to fetch attachment from Resend" });
      }

      const contentType = attachment.contentType || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${attachment.filename || "attachment"}"`
      );

      const buffer = Buffer.from(await response.arrayBuffer());
      return res.send(buffer);
    }

    res.status(404).json({ message: "Attachment source not available" });
  } catch (err) {
    console.error("Error getting attachment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  listThreads,
  searchThreads,
  getThread,
  updateThread,
  deleteThread,
  getAttachment,
};
