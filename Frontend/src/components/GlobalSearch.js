import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { coingeckoAPI } from "../services/coingecko";
import { useDebounce } from "../hooks/useDebounce";

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 350);
  const navigate = useNavigate();
  const ref = useRef(null);
  const inputRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const coins = await coingeckoAPI.searchCoins(q);
      setResults(coins);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { search(debounced); }, [debounced, search]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const go = (id) => {
    navigate(`/coin/${id}`);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const handleFocus = (e) => {
    setOpen(true);
    e.target.style.borderColor = "var(--accent)";
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = "var(--border)";
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 300 }}>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)", display: "flex", alignItems: "center", pointerEvents: "none",
        }}>
          <SearchIcon />
        </span>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search coins... ( / )"
          style={{
            width: "100%", padding: "7px 32px 7px 30px",
            background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
            borderRadius: 8, color: "var(--text-primary)", fontSize: 13,
            outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
        />

        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "var(--text-muted)",
              cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1,
              display: "flex", alignItems: "center",
            }}
          >×</button>
        )}
      </div>

      {open && query.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, zIndex: 300, overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}>
          {loading ? (
            <div style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 12, height: 12, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 13 }}>
              No results for "{query}"
            </div>
          ) : (
            <>
              <div style={{ padding: "8px 14px 4px", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Coins
              </div>
              {results.map((coin) => (
                <div
                  key={coin.id}
                  onClick={() => go(coin.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 14px", cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <img
                    src={coin.thumb} alt={coin.name}
                    style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {coin.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{coin.symbol?.toUpperCase()}</div>
                  </div>
                  {coin.market_cap_rank && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 6 }}>
                      #{coin.market_cap_rank}
                    </span>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
