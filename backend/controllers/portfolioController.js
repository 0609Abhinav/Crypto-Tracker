const Portfolio = require("../models/Portfolio");

const getPortfolio = async (req, res) => {
  try {
    const p = await Portfolio.findOne({ userId: req.user.id });
    return res.json({ status: true, holdings: p ? p.holdings : [] });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const addHolding = async (req, res) => {
  try {
    const { coinId, coinName, coinSymbol, coinImage, quantity, buyPrice, buyDate, notes } = req.body;
    if (!coinId || !coinName || !coinSymbol || quantity == null || buyPrice == null)
      return res.status(400).json({ status: false, message: "coinId, coinName, coinSymbol, quantity and buyPrice are required" });

    const p = await Portfolio.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { holdings: { coinId, coinName, coinSymbol, coinImage: coinImage || "", quantity, buyPrice, buyDate: buyDate || new Date(), notes: notes || "" } } },
      { upsert: true, new: true }
    );
    return res.json({ status: true, holdings: p.holdings });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const updateHolding = async (req, res) => {
  try {
    const { holdingId } = req.params;
    const { quantity, buyPrice, buyDate, notes } = req.body;

    const p = await Portfolio.findOne({ userId: req.user.id });
    if (!p) return res.status(404).json({ status: false, message: "Portfolio not found" });

    const h = p.holdings.id(holdingId);
    if (!h) return res.status(404).json({ status: false, message: "Holding not found" });

    if (quantity != null) h.quantity = quantity;
    if (buyPrice != null) h.buyPrice = buyPrice;
    if (buyDate != null) h.buyDate = buyDate;
    if (notes != null) h.notes = notes;

    await p.save();
    return res.json({ status: true, holdings: p.holdings });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const deleteHolding = async (req, res) => {
  try {
    const { holdingId } = req.params;
    const p = await Portfolio.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { holdings: { _id: holdingId } } },
      { new: true }
    );
    return res.json({ status: true, holdings: p ? p.holdings : [] });
  } catch {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = { getPortfolio, addHolding, updateHolding, deleteHolding };
