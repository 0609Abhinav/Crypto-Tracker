const mongoose = require("mongoose");

const priceAlertSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coinId:     { type: String, required: true },
  coinName:   { type: String, required: true },
  coinSymbol: { type: String, required: true },
  targetPrice:{ type: Number, required: true },
  condition:  { type: String, enum: ["above", "below"], required: true },
  triggered:  { type: Boolean, default: false },
  active:     { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("PriceAlert", priceAlertSchema);
