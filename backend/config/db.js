const mongoose = require("mongoose");

const connectDB = async (retries = 3, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 15000,
        tls: true,
        tlsAllowInvalidCertificates: false,
      });
      console.log("MongoDB connected");
      return;
    } catch (err) {
      console.error(`MongoDB attempt ${i}/${retries} failed: ${err.message}`);
      if (i === retries) {
        console.error("All MongoDB connection attempts failed. Auth/Watchlist features will be unavailable.");
        return;
      }
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

module.exports = connectDB;
