const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

    return res.status(201).json({
      status: true,
      message: "Account created successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
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
    return res.json({
      status: true,
      message: "Logged in successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
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
  } catch (err) {
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
    return res.json({
      status: true,
      message: "Profile updated",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = { signup, login, getMe, updateProfile };
