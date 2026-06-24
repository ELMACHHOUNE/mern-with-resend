const mongoose = require("mongoose");

const emailThreadSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    participants: [{ type: String }],
    lastMessageAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: true },
    isStarred: { type: Boolean, default: false },
    folder: {
      type: String,
      enum: ["inbox", "sent", "drafts", "trash", "spam"],
      default: "inbox",
    },
    labels: [{ type: String }],
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

emailThreadSchema.index({ lastMessageAt: -1 });
emailThreadSchema.index({ folder: 1, lastMessageAt: -1 });

module.exports = mongoose.model("EmailThread", emailThreadSchema);
