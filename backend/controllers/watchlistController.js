const Watchlist = require("../models/Watchlist");

const getWatchlist = async (req, res) => {
  try {
    const wl = await Watchlist.findOne({ userId: req.user.id });
    return res.json({ status: true, coinIds: wl ? wl.coinIds : [] });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const addCoin = async (req, res) => {
  try {
    const { coinId } = req.body;
    if (!coinId) return res.status(400).json({ status: false, message: "coinId required" });

    const wl = await Watchlist.findOneAndUpdate(
      { userId: req.user.id },
      { $addToSet: { coinIds: coinId } },
      { upsert: true, new: true }
    );
    return res.json({ status: true, coinIds: wl.coinIds });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const removeCoin = async (req, res) => {
  try {
    const { coinId } = req.params;
    const wl = await Watchlist.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { coinIds: coinId } },
      { new: true }
    );
    return res.json({ status: true, coinIds: wl ? wl.coinIds : [] });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = { getWatchlist, addCoin, removeCoin };
