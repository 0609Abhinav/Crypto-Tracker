import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrending } from "../store/marketSlice";
import { coingeckoAPI } from "../services/coingecko";
import CardsGrid from "../components/CardsGrid";

const FlameIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c4.97 0 9-3.582 9-8 0-4.195-3.52-6.937-5-8-1.5 2.5-4 4-4 7-1.5-1.5-2.5-4-1-7C8 6 3 9.5 3 14c0 4.418 4.03 8 9 8z"/>
  </svg>
);

export default function Trending() {
  const dispatch = useDispatch();
  const { trending, trendingLoading } = useSelector((s) => s.market);
  const currency = useSelector((s) => s.currency.current);

  // Live prices for trending coins in the selected currency
  const [livePrices,    setLivePrices]    = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);

  // Fetch trending list (runs once — not currency-aware)
  useEffect(() => {
    if (!trending.length) dispatch(fetchTrending());
  }, [dispatch, trending.length]);

  // Re-fetch live prices whenever currency OR trending list changes
  useEffect(() => {
    if (!trending.length) return;
    const ids = trending.map((c) => c.id);
    setPricesLoading(true);
    coingeckoAPI.getCoinsByIds(ids, currency.code)
      .then((coins) => {
        const map = {};
        coins.forEach((c) => {
          map[c.id] = {
            price:     c.price,
            change:    c.change,
            marketCap: c.marketCap,
            sparkline: c.sparkline,
            change7d:  c.change7d,
          };
        });
        setLivePrices(map);
      })
      .catch(() => {})
      .finally(() => setPricesLoading(false));
  }, [trending, currency.code]);

  // Merge live prices into trending coins
  const trendingDisplay = trending.map((c) => {
    const live = livePrices[c.id];
    if (!live) return c;
    return {
      ...c,
      price:     live.price     ?? c.price,
      change:    live.change    ?? c.change,
      marketCap: live.marketCap ?? c.marketCap,
      sparkline: live.sparkline ?? c.sparkline,
      change7d:  live.change7d  ?? c.change7d,
    };
  });

  // Show skeleton only on first load, not on currency switch
  const showSkeleton = trendingLoading || (!!trending.length && pricesLoading && !Object.keys(livePrices).length);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FlameIcon />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Trending Coins</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Most searched coins on CoinGecko in the last 24 hours
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Prices loading indicator */}
          {pricesLoading && Object.keys(livePrices).length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent)", padding: "5px 12px", borderRadius: 20, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse-ring 1.5s ease infinite" }} />
              Updating prices...
            </div>
          )}
          <button
            onClick={() => dispatch(fetchTrending())}
            disabled={trendingLoading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: trendingLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: trendingLoading ? 0.5 : 1, transition: "all 0.2s" }}
            onMouseEnter={(e) => { if (!trendingLoading) e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: trendingLoading ? "spin 0.7s linear infinite" : "none" }}>
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Count badge */}
      {!trendingLoading && trending.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Showing</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", background: "rgba(99,102,241,0.1)", padding: "2px 10px", borderRadius: 20, border: "1px solid rgba(99,102,241,0.2)" }}>
            {trending.length} coins
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>· prices in {currency.label}</span>
        </div>
      )}

      <CardsGrid coins={trendingDisplay} loading={showSkeleton} skeletonCount={15} />
    </div>
  );
}
