const express = require("express");
const {
  signup,
  signin,
  logout,
  getCurrentUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;
