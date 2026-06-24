const express = require("express");
const {
  listThreads,
  searchThreads,
  getThread,
  updateThread,
  deleteThread,
  getAttachment,
} = require("../controllers/inboxController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, listThreads);
router.get("/search", authMiddleware, searchThreads);
router.get("/thread/:threadId", authMiddleware, getThread);
router.patch("/thread/:threadId", authMiddleware, updateThread);
router.delete("/thread/:threadId", authMiddleware, deleteThread);
router.get("/attachments/:messageId/:attachmentId", authMiddleware, getAttachment);

module.exports = router;
