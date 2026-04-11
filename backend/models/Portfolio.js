const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema({
  coinId:    { type: String, required: true },
  coinName:  { type: String, required: true },
  coinSymbol:{ type: String, required: true },
  coinImage: { type: String, default: "" },
  quantity:  { type: Number, required: true, min: 0 },
  buyPrice:  { type: Number, required: true, min: 0 },
  buyDate:   { type: Date, default: Date.now },
  notes:     { type: String, default: "" },
}, { _id: true });

const portfolioSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  holdings: { type: [holdingSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Portfolio", portfolioSchema);
