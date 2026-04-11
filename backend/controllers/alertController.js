const PriceAlert = require("../models/PriceAlert");

const getAlerts = async (req, res) => {
  try {
    const alerts = await PriceAlert.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ status: true, alerts });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const createAlert = async (req, res) => {
  try {
    const { coinId, coinName, coinSymbol, targetPrice, condition } = req.body;
    if (!coinId || !coinName || !coinSymbol || targetPrice == null || !condition)
      return res.status(400).json({ status: false, message: "All fields required" });

    const alert = await PriceAlert.create({ userId: req.user.id, coinId, coinName, coinSymbol, targetPrice, condition });
    return res.status(201).json({ status: true, alert });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    await PriceAlert.findOneAndDelete({ _id: alertId, userId: req.user.id });
    return res.json({ status: true });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const toggleAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await PriceAlert.findOne({ _id: alertId, userId: req.user.id });
    if (!alert) return res.status(404).json({ status: false, message: "Alert not found" });
    alert.active = !alert.active;
    await alert.save();
    return res.json({ status: true, alert });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = { getAlerts, createAlert, deleteAlert, toggleAlert };
