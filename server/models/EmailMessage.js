const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String },
    contentType: { type: String },
    size: { type: Number },
    resendAttachmentId: { type: String },
  },
  { _id: false }
);

const emailMessageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailThread",
      required: true,
      index: true,
    },
    resendId: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
    },
    from: { type: String },
    to: [{ type: String }],
    cc: [{ type: String }],
    bcc: [{ type: String }],
    subject: { type: String },
    html: { type: String },
    text: { type: String },
    headers: {
      messageId: { type: String },
      inReplyTo: { type: String },
      references: [{ type: String }],
    },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: ["sent", "delivered", "bounced", "failed", "received"],
      default: "received",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

emailMessageSchema.index({ subject: "text", text: "text", from: "text" });

module.exports = mongoose.model("EmailMessage", emailMessageSchema);
