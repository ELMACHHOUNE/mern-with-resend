const express = require("express");
const {
  sendEmail,
  saveDraft,
  updateDraft,
} = require("../controllers/emailController");
const authMiddleware = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const sendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many requests. Please try again later." },
});

router.post("/send", authMiddleware, sendLimiter, sendEmail);
router.post("/draft", authMiddleware, saveDraft);
router.patch("/draft/:id", authMiddleware, updateDraft);

module.exports = router;
