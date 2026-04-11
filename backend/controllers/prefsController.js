const UserPrefs = require("../models/UserPrefs");

const getPrefs = async (req, res) => {
  try {
    const prefs = await UserPrefs.findOne({ userId: req.user.id });
    return res.json({ status: true, prefs: prefs || { currency: "usd", theme: "dark", recentlyViewed: [] } });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const updatePrefs = async (req, res) => {
  try {
    const { currency, theme } = req.body;
    const update = {};
    if (currency) update.currency = currency;
    if (theme)    update.theme    = theme;

    const prefs = await UserPrefs.findOneAndUpdate(
      { userId: req.user.id },
      { $set: update },
      { upsert: true, new: true }
    );
    return res.json({ status: true, prefs });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const addRecentlyViewed = async (req, res) => {
  try {
    const coin = req.body;
    if (!coin?.id) return res.status(400).json({ status: false, message: "coin.id required" });

    // Pull existing entry for this coin, then push to front, keep max 10
    await UserPrefs.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { recentlyViewed: { id: coin.id } } },
      { upsert: true }
    );
    const prefs = await UserPrefs.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { recentlyViewed: { $each: [coin], $position: 0, $slice: 10 } } },
      { upsert: true, new: true }
    );
    return res.json({ status: true, recentlyViewed: prefs.recentlyViewed });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const clearRecentlyViewed = async (req, res) => {
  try {
    await UserPrefs.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { recentlyViewed: [] } },
      { upsert: true }
    );
    return res.json({ status: true, recentlyViewed: [] });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = { getPrefs, updatePrefs, addRecentlyViewed, clearRecentlyViewed };
