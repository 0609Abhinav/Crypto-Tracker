import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarket } from "../store/marketSlice";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { addToWatchlist, removeFromWatchlist, optimisticAdd, optimisticRemove } from "../store/watchlistSlice";
import { useToast } from "../components/ui/Toast";
import { TableRowSkeleton } from "../components/ui/Skeletons";
import { formatPrice, formatChange, formatLarge } from "../utils/format";
import Sparkline from "../components/Sparkline";
import { useCurrency } from "../hooks/useCurrency";
import { clearCoins } from "../store/marketSlice";

const PAGE_SIZES = [5, 20, 25, 30];
const SORTS = [
  { key: "rank", label: "Rank" },
  { key: "price", label: "Price" },
  { key: "change", label: "24h %" },
  { key: "marketCap", label: "Market Cap" },
];

// ─── Pagination button ────────────────────────────────────────────────────────
const PBtn = ({ onClick, disabled, active, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      minWidth: 34, height: 34, padding: "0 8px",
      borderRadius: 8, border: "1px solid",
      borderColor: active ? "var(--accent)" : "var(--border)",
      background: active ? "rgba(99,102,241,0.15)" : "transparent",
      color: active ? "var(--accent)" : disabled ? "var(--text-muted)" : "var(--text-secondary)",
      fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "inherit", transition: "all 0.15s", opacity: disabled ? 0.4 : 1,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
    onMouseEnter={(e) => { if (!disabled && !active) e.currentTarget.style.borderColor = "var(--accent)"; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--border)"; }}
  >
    {children}
  </button>
);

// ─── Search icon ──────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function Market() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { coins, loading } = useSelector((s) => s.market);
  const { coinIds } = useSelector((s) => s.watchlist);
  const { user } = useSelector((s) => s.auth);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rank");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const debouncedSearch = useDebounce(search);
  const { currency } = useCurrency();

  useEffect(() => {
    dispatch(clearCoins());
    dispatch(fetchMarket({ currency: currency.code }));
  }, [dispatch, currency.code]);
  useEffect(() => { setPage(1); }, [debouncedSearch, sort, sortDir, pageSize]);

  const filtered = useMemo(() => {
    let list = [...coins];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const av = a[sort] ?? 0, bv = b[sort] ?? 0;
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return list;
  }, [coins, debouncedSearch, sort, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key) => {
    if (sort === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(key); setSortDir("desc"); }
  };

  const handleStar = (e, coin) => {
    e.stopPropagation();
    if (!user) { toast("Login to manage your watchlist", "warning"); return; }
    if (coinIds.includes(coin.id)) {
      dispatch(optimisticRemove(coin.id));
      dispatch(removeFromWatchlist(coin.id));
      toast(`${coin.name} removed`, "info");
    } else {
      dispatch(optimisticAdd(coin.id));
      dispatch(addToWatchlist(coin.id));
      toast(`${coin.name} added to watchlist`, "success");
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const SortTh = ({ k, label }) => (
    <button onClick={() => toggleSort(k)} style={{
      background: "none", border: "none",
      color: sort === k ? "var(--accent)" : "var(--text-muted)",
      cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit",
      display: "flex", alignItems: "center", gap: 3, textTransform: "uppercase", letterSpacing: 0.5,
    }}>
      {label}{sort === k ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
    </button>
  );

  // Serial number = global position in filtered list
  const getSerial = (idx) => (page - 1) * pageSize + idx + 1;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Crypto Market</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          {loading ? "Loading..." : `${filtered.length.toLocaleString()} cryptocurrencies · prices in ${currency.label}`}
        </p>
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", display: "flex", alignItems: "center", pointerEvents: "none",
          }}>
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or symbol..."
            style={{
              width: "100%", padding: "10px 36px 10px 32px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 10, color: "var(--text-primary)", fontSize: 14,
              outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border)"}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "var(--text-muted)",
              cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0,
            }}>×</button>
          )}
        </div>

        {/* Sort buttons */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SORTS.map(({ key, label }) => (
            <button key={key} onClick={() => toggleSort(key)} style={{
              padding: "8px 14px", borderRadius: 8, border: "1px solid",
              borderColor: sort === key ? "var(--accent)" : "var(--border)",
              background: sort === key ? "rgba(99,102,241,0.1)" : "transparent",
              color: sort === key ? "var(--accent)" : "var(--text-secondary)",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s", whiteSpace: "nowrap",
            }}>
              {label}{sort === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
            </button>
          ))}
        </div>

        {/* Page size selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Rows:</span>
          <div style={{ display: "flex", gap: 4 }}>
            {PAGE_SIZES.map((s) => (
              <button key={s} onClick={() => setPageSize(s)} style={{
                padding: "6px 10px", borderRadius: 7, border: "1px solid",
                borderColor: pageSize === s ? "var(--accent)" : "var(--border)",
                background: pageSize === s ? "rgba(99,102,241,0.12)" : "transparent",
                color: pageSize === s ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>

        {/* Header row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "48px 2.5fr 1fr 1fr 1.2fr 90px 50px",
          gap: 12, padding: "11px 20px",
          borderBottom: "1px solid var(--border)",
          background: "rgba(255,255,255,0.025)",
        }}>
          <SortTh k="rank" label="#" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Name</span>
          <SortTh k="price" label="Price" />
          <SortTh k="change" label="24h %" />
          <SortTh k="marketCap" label="Market Cap" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>7D Chart</span>
          <span />
        </div>

        {/* Skeleton rows */}
        {loading && Array.from({ length: pageSize }).map((_, i) => <TableRowSkeleton key={i} />)}

        {/* Data rows */}
        {!loading && paginated.map((coin, idx) => {
          const isPos = (coin.change ?? 0) >= 0;
          const isWatched = coinIds.includes(coin.id);
          const serial = getSerial(idx);
          return (
            <div
              key={coin.id}
              onClick={() => navigate(`/coin/${coin.id}`)}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 2.5fr 1fr 1fr 1.2fr 90px 50px",
                gap: 12, padding: "13px 20px", alignItems: "center",
                borderBottom: "1px solid var(--border)", cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {/* Serial number */}
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textAlign: "right" }}>
                {serial}
              </span>

              {/* Name + image */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <img src={coin.image} alt={coin.name} style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {coin.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{coin.symbol}</div>
                </div>
              </div>

              {/* Price */}
              <span style={{ fontWeight: 700, fontSize: 14 }}>{formatPrice(coin.price, currency.symbol)}</span>

              {/* 24h change */}
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: isPos ? "var(--green)" : "var(--red)",
              }}>
                {isPos ? "▲" : "▼"} {formatChange(coin.change)}
              </span>

              {/* Market cap */}
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{formatLarge(coin.marketCap, currency.symbol)}</span>

              {/* Sparkline */}
              <div onClick={(e) => e.stopPropagation()}>
                <Sparkline data={coin.sparkline} isPositive={isPos} width={90} height={36} />
              </div>

              {/* Watchlist star */}
              <button
                onClick={(e) => handleStar(e, coin)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 18, color: isWatched ? "var(--yellow)" : "var(--text-muted)",
                  transition: "color 0.2s", padding: 0,
                }}
              >
                {isWatched ? "★" : "☆"}
              </button>
            </div>
          );
        })}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            No coins found for "{search}"
          </div>
        )}
      </div>

      {/* Pagination footer */}
      {!loading && filtered.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 20, flexWrap: "wrap", gap: 12,
        }}>
          {/* Info */}
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Showing <strong style={{ color: "var(--text-secondary)" }}>{(page - 1) * pageSize + 1}</strong>–<strong style={{ color: "var(--text-secondary)" }}>{Math.min(page * pageSize, filtered.length)}</strong> of <strong style={{ color: "var(--text-secondary)" }}>{filtered.length}</strong>
          </span>

          {/* Page buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <PBtn onClick={() => setPage(1)} disabled={page === 1}>«</PBtn>
            <PBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>‹</PBtn>

            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} style={{ color: "var(--text-muted)", padding: "0 4px", fontSize: 13, userSelect: "none" }}>…</span>
              ) : (
                <PBtn key={p} onClick={() => setPage(p)} active={page === p}>{p}</PBtn>
              )
            )}

            <PBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>›</PBtn>
            <PBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PBtn>
          </div>

          {/* Page x of y */}
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Page <strong style={{ color: "var(--text-secondary)" }}>{page}</strong> of <strong style={{ color: "var(--text-secondary)" }}>{totalPages}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
