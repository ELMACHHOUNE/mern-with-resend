const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const User = require("../models/User");

const resend = new Resend(process.env.RESEND_API_KEY);

const buildToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      verificationToken: verificationCode,
    });

    const { error } = await resend.emails.send({
      from: "Admin <admin@3d-maghribi.com>",
      to: normalizedEmail,
      subject: "Your verification code",
      html: `<p>Hi ${name.trim()},</p><p>Your verification code is:</p><h2 style="font-size:32px;letter-spacing:8px;text-align:center;color:#4f46e5;">${verificationCode}</h2><p>Enter this code on the verification page to activate your account.</p>`,
    });

    if (error) {
      return res
        .status(400)
        .json({
          message: error.message || "Failed to send verification email",
        });
    }

    return res.status(201).json({
      message:
        "Account created. Please check your email to verify your account.",
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and verification code are required" });
  }

  try {
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      verificationToken: code,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Email verified successfully. You can now sign in." });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before signing in" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = buildToken(user._id);

    return res.status(200).json({
      message: "Signed in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

const resendCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    user.verificationToken = verificationCode;
    await user.save();

    const { error } = await resend.emails.send({
      from: "Admin <admin@3d-maghribi.com>",
      to: normalizedEmail,
      subject: "Your new verification code",
      html: `<p>Your new verification code is:</p><h2 style="font-size:32px;letter-spacing:8px;text-align:center;color:#4f46e5;">${verificationCode}</h2>`,
    });

    if (error) {
      return res.status(400).json({ message: error.message || "Failed to send code" });
    }

    return res.status(200).json({ message: "New verification code sent to your email" });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();
    user.resetToken = resetCode;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const { error } = await resend.emails.send({
      from: "Admin <admin@3d-maghribi.com>",
      to: normalizedEmail,
      subject: "Password reset code",
      html: `<p>Your password reset code is:</p><h2 style="font-size:32px;letter-spacing:8px;text-align:center;color:#4f46e5;">${resetCode}</h2><p>This code expires in 15 minutes.</p>`,
    });

    if (error) {
      return res.status(400).json({ message: error.message || "Failed to send reset code" });
    }

    return res.status(200).json({ message: "Reset code sent to your email" });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, code, password } = req.body;

  if (!email || !code || !password) {
    return res.status(400).json({ message: "Email, code, and new password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({
      email: normalizedEmail,
      resetToken: code,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully. You can now sign in." });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

const logout = (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
};

const getCurrentUser = (req, res) => {
  return res.status(200).json({ user: req.user });
};

module.exports = {
  signup,
  signin,
  logout,
  getCurrentUser,
  verifyEmail,
  resendCode,
  forgotPassword,
  resetPassword,
};
