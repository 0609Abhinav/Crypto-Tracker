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

// CORS — allow configured origin(s) + localhost for dev
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "https://crypto-tracker-1-mqn0.onrender.com",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Render health checks, mobile)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    // In development, allow all
    if (process.env.NODE_ENV !== "production") return cb(null, true);
    cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Handle preflight for all routes
app.options("*", cors());

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
