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
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      verificationToken,
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    const { error } = await resend.emails.send({
      from: "Admin <admin@gotodev.ma>",
      to: normalizedEmail,
      subject: "Verify your email address",
      html: `<p>Hi ${name.trim()},</p><p>Click <a href="${verifyUrl}">here</a> to verify your email address.</p><p>Or paste this link in your browser:</p><p>${verifyUrl}</p>`,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(201).json({
      message: "Account created. Please check your email to verify your account.",
    });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully. You can now sign in." });
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
      return res.status(403).json({ message: "Please verify your email before signing in" });
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
};
