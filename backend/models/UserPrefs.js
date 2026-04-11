const mongoose = require("mongoose");

const recentCoinSchema = new mongoose.Schema({
  id:     { type: String, required: true },
  name:   { type: String, required: true },
  symbol: { type: String, required: true },
  image:  { type: String, default: "" },
  price:  { type: Number, default: null },
  change: { type: Number, default: null },
}, { _id: false });

const userPrefsSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  currency:      { type: String, default: "usd" },
  theme:         { type: String, enum: ["dark", "light"], default: "dark" },
  recentlyViewed:{ type: [recentCoinSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("UserPrefs", userPrefsSchema);
