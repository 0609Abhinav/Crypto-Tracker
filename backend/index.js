require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

// Security headers
app.use(helmet());

// Logging
app.use(morgan("dev"));

// CORS
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Body parser
app.use(express.json());

// Global rate limit — 100 req/15min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Auth routes — stricter limit
app.use("/api/v1/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: false, message: "Too many auth attempts, please try again later." },
}), require("./routes/auth"));

app.use("/api/v1/watchlist", require("./routes/watchlist"));
app.use("/api/v1/portfolio", require("./routes/portfolio"));
app.use("/api/v1/alerts",    require("./routes/alerts"));
app.use("/api/v1/prefs",     require("./routes/prefs"));

app.get("/", (req, res) => res.json({ message: "CryptoTracker API running" }));

// 404
app.use((req, res) => res.status(404).json({ status: false, message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
