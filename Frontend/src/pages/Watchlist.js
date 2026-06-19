import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchWatchlist } from "../store/watchlistSlice";
import { coingeckoAPI } from "../services/coingecko";
import CardsGrid from "../components/CardsGrid";
import Button from "../components/ui/Button";
import { RefreshIcon, DownloadIcon, StarIcon, SearchIcon } from "../components/Icons";

const SORTS = [
  { key: "default",      label: "Default"  },
  { key: "price_desc",   label: "Price ↓"  },
  { key: "price_asc",    label: "Price ↑"  },
  { key: "change_desc",  label: "Gain ↓"   },
  { key: "change_asc",   label: "Loss ↓"   },
  { key: "marketCap_desc",label: "MCap ↓" },
];

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportCSV(coins, currencyLabel) {
  if (!coins.length) return;
  const header = ["Name", "Symbol", `Price (${currencyLabel})`, "24h Change %", "Market Cap", "7D Change %"];
  const rows   = coins.map((c) => [
    c.name, c.symbol,
    c.price?.toFixed(6) ?? "",
    c.change?.toFixed(2) ?? "",
    c.marketCap?.toFixed(0) ?? "",
    c.change7d?.toFixed(2) ?? "",
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `watchlist_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Watchlist() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { coinIds }  = useSelector((s) => s.watchlist);
  const { user }     = useSelector((s) => s.auth);
  const currency     = useSelector((s) => s.currency.current);

  const [coins,        setCoins]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [sortKey,      setSortKey]      = useState("default");
  const [search,       setSearch]       = useState("");

  const sortedCoins = useMemo(() => {
    let list = [...coins];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    switch (sortKey) {
      case "price_desc":     return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "price_asc":      return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case "change_desc":    return list.sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
      case "change_asc":     return list.sort((a, b) => (a.change ?? 0) - (b.change ?? 0));
      case "marketCap_desc": return list.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
      default: return list;
    }
  }, [coins, sortKey, search]);

  useEffect(() => {
    if (user) dispatch(fetchWatchlist());
  }, [user, dispatch]);

  const loadCoins = useCallback(async (isRefresh = false) => {
    if (!coinIds.length) { setCoins([]); return; }
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const data    = await coingeckoAPI.getCoinsByIds(coinIds, currency.code);
      const ordered = coinIds.map((id) => data.find((c) => c.id === id)).filter(Boolean);
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
    <div style={{ maxWidth: 480, margin: "120px auto", textAlign: "center", padding: 20 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
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
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <StarFilledIcon size={20} color="#f59e0b" />
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800 }}>My Watchlist</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, padding: "3px 12px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.2)" }}>
                {coinIds.length} coin{coinIds.length !== 1 ? "s" : ""}
              </span>
              {lastUpdated && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {coins.length > 0 && (
              <button
                onClick={() => exportCSV(coins, currency.label)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 9, border: "1px solid var(--border)",
                  background: "transparent", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                title="Export watchlist as CSV"
              >
                <DownloadIcon size={14} color="currentColor" />
                Export CSV
              </button>
            )}
            {coinIds.length > 0 && (
              <Button variant="ghost" size="sm" loading={refreshing} onClick={() => loadCoins(true)}>
                <RefreshIcon size={13} color="currentColor" spinning={refreshing} />
                &nbsp;Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Sort + Search controls */}
        {coinIds.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <SearchIcon size={13} color="var(--text-muted)" />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter coins..."
                style={{
                  padding: "7px 12px 7px 30px", background: "var(--bg-card)",
                  border: "1px solid var(--border)", borderRadius: 8,
                  color: "var(--text-primary)", fontSize: 13, outline: "none",
                  fontFamily: "inherit", width: 190, transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SORTS.map((s) => (
                <button key={s.key} onClick={() => setSortKey(s.key)} style={{
                  padding: "6px 12px", borderRadius: 8, border: "1px solid",
                  borderColor: sortKey === s.key ? "var(--accent)" : "var(--border)",
                  background: sortKey === s.key ? "rgba(99,102,241,0.1)" : "transparent",
                  color: sortKey === s.key ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}>
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
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {error}
          </span>
          <button onClick={() => loadCoins()} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && coinIds.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20,
        }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <StarIcon size={32} color="var(--accent)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Your watchlist is empty</h3>
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
          {/* Avatar strip */}
          {!loading && coins.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ display: "flex" }}>
                {coins.slice(0, 10).map((c, i) => (
                  <img
                    key={c.id} src={c.image} alt={c.name} title={c.name}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      border: "2px solid var(--bg-primary)",
                      marginLeft: i === 0 ? 0 : -8,
                      zIndex: coins.length - i, position: "relative",
                    }}
                    onClick={() => navigate(`/coin/${c.id}`)}
                    onError={(e) => e.target.style.display = "none"}
                  />
                ))}
              </div>
              {coins.length > 10 && (
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                  +{coins.length - 10} more
                </span>
              )}
              {search && sortedCoins.length !== coins.length && (
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>
                  Showing {sortedCoins.length} of {coins.length}
                </span>
              )}
            </div>
          )}

          <CardsGrid coins={sortedCoins} loading={loading} skeletonCount={coinIds.length || 4} />
        </>
      )}
    </div>
  );
}

// Local StarFilledIcon for watchlist header
function StarFilledIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
