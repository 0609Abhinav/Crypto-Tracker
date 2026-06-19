import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchTrending, fetchMarket } from "../store/marketSlice";
import CardsGrid from "../components/CardsGrid";
import FearGreedWidget from "../components/FearGreedWidget";
import { formatPrice, formatChange } from "../utils/format";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { coingeckoAPI } from "../services/coingecko";
import { FlameIcon, TrendUpIcon, TrendDownIcon, ClockIcon } from "../components/Icons";

// Mini ticker shown in the hero section
const MiniTicker = ({ coin, currencySymbol }) => {
  const navigate = useNavigate();
  const isPos = (coin.change ?? 0) >= 0;
  return (
    <div
      onClick={() => navigate(`/coin/${coin.id}`)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 12px", borderRadius: 8, cursor: "pointer",
        background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
        flexShrink: 0, transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
    >
      <img src={coin.image} alt={coin.name} style={{ width: 18, height: 18, borderRadius: "50%" }} />
      <span style={{ fontSize: 12, fontWeight: 600 }}>{coin.symbol}</span>
      <span style={{ fontSize: 12, fontWeight: 700 }}>{formatPrice(coin.price, currencySymbol)}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: isPos ? "var(--green)" : "var(--red)", display: "flex", alignItems: "center", gap: 2 }}>
        {isPos
          ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        }
        {formatChange(coin.change)}
      </span>
    </div>
  );
};

export default function Home() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { trending, coins, trendingLoading, loading } = useSelector((s) => s.market);
  const { user }   = useSelector((s) => s.auth);
  const { recent } = useRecentlyViewed();
  const currency   = useSelector((s) => s.currency.current);

  // ── Local state: live prices for trending coins in the active currency ────
  const [trendingPrices, setTrendingPrices]   = useState({}); // { coinId: { price, change } }
  const [pricesLoading,  setPricesLoading]    = useState(false);

  // 1. Fetch trending list (only once — not currency-aware)
  useEffect(() => {
    if (!trending.length) dispatch(fetchTrending());
  }, [dispatch, trending.length]);

  // 2. Whenever currency OR trending list changes, fetch live prices in that currency
  useEffect(() => {
    if (!trending.length) return;
    const ids = trending.map((c) => c.id);
    setPricesLoading(true);
    coingeckoAPI.getCoinsByIds(ids, currency.code)
      .then((coins) => {
        const map = {};
        coins.forEach((c) => { map[c.id] = { price: c.price, change: c.change, marketCap: c.marketCap, sparkline: c.sparkline, change7d: c.change7d }; });
        setTrendingPrices(map);
      })
      .catch(() => {})
      .finally(() => setPricesLoading(false));
  }, [trending, currency.code]);

  // 3. Market data (for gainers/losers + hero ticker)
  useEffect(() => {
    dispatch(fetchMarket({ currency: currency.code }));
  }, [dispatch, currency.code]);

  // Build display coins by merging trending with live prices
  const trendingDisplay = trending.slice(0, 8).map((c) => {
    const live = trendingPrices[c.id];
    if (!live) return c; // fallback to original until live arrives
    return {
      ...c,
      price:     live.price     ?? c.price,
      change:    live.change    ?? c.change,
      marketCap: live.marketCap ?? c.marketCap,
      sparkline: live.sparkline ?? c.sparkline,
      change7d:  live.change7d  ?? c.change7d,
    };
  });

  const gainers     = [...coins].filter((c) => c.change != null).sort((a, b) => b.change - a.change).slice(0, 4);
  const losers      = [...coins].filter((c) => c.change != null).sort((a, b) => a.change - b.change).slice(0, 4);
  const tickerCoins = coins.slice(0, 8);

  // Show grid skeleton while trending is loading OR live prices are loading
  const trendingGridLoading = trendingLoading || (!!trending.length && pricesLoading && !Object.keys(trendingPrices).length);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div style={{
        textAlign: "center", padding: "60px 20px 68px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)",
        borderRadius: 24, marginBottom: 48, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025,
          backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none",
        }} />
        <div style={{
          display: "inline-block", padding: "4px 14px", borderRadius: 20,
          background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
          fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 20, letterSpacing: 1.5,
        }}>
          LIVE CRYPTO DATA
        </div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.12, marginBottom: 18 }}>
          Track Every Coin.<br />
          <span style={{ color: "var(--accent)" }}>Make Smarter Moves.</span>
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.65 }}>
          Real-time prices, market trends, news, and your personal watchlist — all in one place.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/market")} style={{
            padding: "12px 26px", borderRadius: 12, border: "none",
            background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >Explore Market →</button>
          <button onClick={() => navigate("/news")} style={{
            padding: "12px 26px", borderRadius: 12,
            border: "1px solid var(--border)", background: "transparent",
            color: "var(--text-primary)", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
          >Latest News</button>
        </div>
        {tickerCoins.length > 0 && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
            {tickerCoins.map((c) => <MiniTicker key={c.id} coin={c} currencySymbol={currency.symbol} />)}
          </div>
        )}
      </div>

      {/* ── Recently Viewed ─────────────────────────────────────────────── */}
      {recent.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
            <ClockIcon size={18} color="var(--text-muted)" />
            Recently Viewed
          </h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {recent.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/coin/${c.id}`)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <img src={c.image} alt={c.name} style={{ width: 22, height: 22, borderRadius: "50%" }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.symbol}</span>
                <span style={{ fontSize: 12, color: (c.change ?? 0) >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                  {formatChange(c.change)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Trending + Fear & Greed sidebar ────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 200px", gap: 32, marginBottom: 56, alignItems: "start" }}>
        <section style={{ minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <FlameIcon size={20} color="#f97316" />
              Trending Now
            </h2>
            <button onClick={() => navigate("/trending")} style={{
              background: "none", border: "none", color: "var(--accent)",
              cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            }}>View all →</button>
          </div>
          {/* Pass merged coins with live prices */}
          <CardsGrid coins={trendingDisplay} loading={trendingGridLoading} skeletonCount={8} />
        </section>
        <div style={{ position: "sticky", top: 80 }}>
          <FearGreedWidget />
        </div>
      </div>

      {/* ── Gainers / Losers ────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28, marginBottom: 56 }}>
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", display: "flex", alignItems: "center", gap: 7 }}>
              <TrendUpIcon size={18} color="var(--green)" />
              Top Gainers
            </h2>
            <button onClick={() => navigate("/gainers")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>See all →</button>
          </div>
          <CardsGrid coins={gainers} loading={loading} skeletonCount={4} />
        </section>
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--red)", display: "flex", alignItems: "center", gap: 7 }}>
              <TrendDownIcon size={18} color="var(--red)" />
              Top Losers
            </h2>
            <button onClick={() => navigate("/gainers")} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>See all →</button>
          </div>
          <CardsGrid coins={losers} loading={loading} skeletonCount={4} />
        </section>
      </div>

      {/* ── CTA — guests only ───────────────────────────────────────────── */}
      {!user && (
        <div style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))",
          border: "1px solid rgba(99,102,241,0.25)", borderRadius: 20,
          padding: "36px 32px", display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 20,
        }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Never miss a move</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 380 }}>
              Create a free account to save coins to your watchlist and track them in real time.
            </p>
          </div>
          <button onClick={() => navigate("/signup")} style={{
            padding: "12px 24px", borderRadius: 12, border: "none",
            background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
          }}>Get Started Free →</button>
        </div>
      )}
    </div>
  );
}
