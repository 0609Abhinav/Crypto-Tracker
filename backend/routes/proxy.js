const express = require("express");
const router  = express.Router();

const COINGECKO = "https://api.coingecko.com/api/v3";

// Simple in-memory cache — reduces duplicate requests
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
};

const setCache = (key, data) => {
  // Keep cache size bounded
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, ts: Date.now() });
};

// Proxy any GET /api/v1/cg/* → https://api.coingecko.com/api/v3/*
router.get("/*", async (req, res) => {
  const path     = req.params[0];
  const query    = new URLSearchParams(req.query).toString();
  const cacheKey = query ? `${path}?${query}` : path;
  const url      = query ? `${COINGECKO}/${path}?${query}` : `${COINGECKO}/${path}`;

  // Serve from cache if fresh
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await fetch(url, {
      headers: {
        "accept": "application/json",
        "User-Agent": "CoinPulse/1.0",
      },
    });

    if (response.status === 429) {
      return res.status(429).json({ error: "Rate limited by CoinGecko. Please wait a moment." });
    }
    if (!response.ok) {
      return res.status(response.status).json({ error: `CoinGecko error: ${response.status}` });
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
