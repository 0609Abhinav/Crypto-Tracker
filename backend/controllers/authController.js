const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ status: false, message: errors.array()[0].msg });
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ status: false, message: "Email already registered" });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash });
    const token = generateToken(user);
    return res.status(201).json({ status: true, message: "Account created successfully", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ status: false, message: errors.array()[0].msg });
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ status: false, message: "No account found with this email" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ status: false, message: "Incorrect password" });
    const token = generateToken(user);
    return res.json({ status: true, message: "Logged in successfully", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ status: false, message: "User not found" });
    return res.json({ status: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });
    if (name) user.name = name.trim();
    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ status: false, message: "Current password required" });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match)
        return res.status(401).json({ status: false, message: "Current password is incorrect" });
      if (newPassword.length < 6)
        return res.status(400).json({ status: false, message: "New password must be at least 6 characters" });
      user.password = await bcrypt.hash(newPassword, 12);
    }
    await user.save();
    const token = generateToken(user);
    return res.json({ status: true, message: "Profile updated", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Forgot password — generates a reset token and returns it (in prod, email it)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: false, message: "Email is required" });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ status: true, message: "If that email exists, a reset link has been sent." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In production: send email with reset link containing `token`
    // For now: return token directly so frontend can use it (dev mode)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    console.log(`[DEV] Password reset link: ${resetUrl}`);

    return res.json({ status: true, message: "If that email exists, a reset link has been sent.", ...(process.env.NODE_ENV !== "production" ? { devToken: token } : {}) });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Reset password — validates token and sets new password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ status: false, message: "Token and password required" });
    if (password.length < 6) return res.status(400).json({ status: false, message: "Password must be at least 6 characters" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ status: false, message: "Reset link is invalid or has expired" });

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ status: true, message: "Password reset successfully. You can now log in." });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = { signup, login, getMe, updateProfile, forgotPassword, resetPassword };
