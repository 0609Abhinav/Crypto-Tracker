import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchWatchlist } from "../store/watchlistSlice";
import { coingeckoAPI } from "../services/coingecko";
import CardsGrid from "../components/CardsGrid";
import Button from "../components/ui/Button";

const SORTS = [
  { key: "default", label: "Default" },
  { key: "price_desc", label: "Price ↓" },
  { key: "price_asc", label: "Price ↑" },
  { key: "change_desc", label: "Gain ↓" },
  { key: "change_asc", label: "Loss ↓" },
  { key: "marketCap_desc", label: "MCap ↓" },
];

export default function Watchlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { coinIds } = useSelector((s) => s.watchlist);
  const { user } = useSelector((s) => s.auth);
  const currency = useSelector((s) => s.currency.current);

  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey, setSortKey] = useState("default");
  const [search, setSearch] = useState("");

  const sortedCoins = useMemo(() => {
    let list = [...coins];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    switch (sortKey) {
      case "price_desc":    return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "price_asc":     return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case "change_desc":   return list.sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
      case "change_asc":    return list.sort((a, b) => (a.change ?? 0) - (b.change ?? 0));
      case "marketCap_desc":return list.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
      default: return list;
    }
  }, [coins, sortKey, search]);

  // Fetch watchlist IDs from backend on mount
  useEffect(() => {
    if (user) dispatch(fetchWatchlist());
  }, [user, dispatch]);

  // Fetch actual coin data whenever coinIds changes
  const loadCoins = useCallback(async (isRefresh = false) => {
    if (!coinIds.length) { setCoins([]); return; }
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      // Fetch ONLY the watchlisted coins by ID — no filtering needed
      const data = await coingeckoAPI.getCoinsByIds(coinIds, currency.code);
      // Preserve the order from coinIds
      const ordered = coinIds
        .map((id) => data.find((c) => c.id === id))
        .filter(Boolean);
      setCoins(ordered);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Failed to load watchlist data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [coinIds, currency.code]);

  useEffect(() => { loadCoins(); }, [loadCoins]);

  // Not logged in
  if (!user) return (
    <div style={{
      maxWidth: 480, margin: "120px auto",
      textAlign: "center", padding: 20,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, margin: "0 auto 24px",
      }}>🔒</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Login Required</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>
        Sign in to access your personal watchlist and track your favourite coins.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Button onClick={() => navigate("/login")}>Login</Button>
        <Button variant="ghost" onClick={() => navigate("/signup")}>Sign Up</Button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>⭐ My Watchlist</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, padding: "3px 12px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.2)" }}>
                {coinIds.length} coin{coinIds.length !== 1 ? "s" : ""}
              </span>
              {lastUpdated && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
            </div>
          </div>
          {coinIds.length > 0 && (
          <Button variant="ghost" size="sm" loading={refreshing} onClick={() => loadCoins(true)}>↻ Refresh</Button>
        )}
        </div>

        {/* Sort + Search controls */}
        {coinIds.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter coins..." style={{ padding: "7px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", width: 180 }} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SORTS.map((s) => (
                <button key={s.key} onClick={() => setSortKey(s.key)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid", borderColor: sortKey === s.key ? "var(--accent)" : "var(--border)", background: sortKey === s.key ? "rgba(99,102,241,0.1)" : "transparent", color: sortKey === s.key ? "var(--accent)" : "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: "14px 18px", borderRadius: 10, marginBottom: 24,
          background: "var(--red-bg)", border: "1px solid var(--red)",
          color: "var(--red)", fontSize: 14,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>⚠️ {error}</span>
          <button
            onClick={() => loadCoins()}
            style={{
              background: "none", border: "none", color: "var(--red)",
              cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && coinIds.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 20,
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, margin: "0 auto 20px",
          }}>📋</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
            Your watchlist is empty
          </h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 28, maxWidth: 320, margin: "0 auto 28px" }}>
            Star any coin from the market or trending page to track it here.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Button onClick={() => navigate("/market")}>Browse Market</Button>
            <Button variant="ghost" onClick={() => navigate("/trending")}>View Trending</Button>
          </div>
        </div>
      ) : (
        <>
          {/* Watched coin image strip — visual indicator */}
          {!loading && coins.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: -8,
              marginBottom: 24, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex" }}>
                {coins.slice(0, 8).map((c, i) => (
                  <img
                    key={c.id}
                    src={c.image}
                    alt={c.name}
                    title={c.name}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      border: "2px solid var(--bg-primary)",
                      marginLeft: i === 0 ? 0 : -8,
                      zIndex: coins.length - i,
                      position: "relative",
                    }}
                  />
                ))}
              </div>
              {coins.length > 8 && (
                <span style={{
                  fontSize: 12, color: "var(--text-muted)",
                  marginLeft: 8, fontWeight: 500,
                }}>
                  +{coins.length - 8} more
                </span>
              )}
            </div>
          )}

          <CardsGrid
            coins={sortedCoins}
            loading={loading}
            skeletonCount={coinIds.length || 4}
          />
        </>
      )}
    </div>
  );
}
