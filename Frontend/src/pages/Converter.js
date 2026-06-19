import React, { useState, useEffect, useCallback } from "react";
import { coingeckoAPI } from "../services/coingecko";
import { useSelector } from "react-redux";
import { formatPrice } from "../utils/format";
import { ArrowsIcon, RefreshIcon } from "../components/Icons";

const POPULAR = [
  { id: "bitcoin",      name: "Bitcoin",  symbol: "BTC",  thumb: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png" },
  { id: "ethereum",     name: "Ethereum", symbol: "ETH",  thumb: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png" },
  { id: "tether",       name: "Tether",   symbol: "USDT", thumb: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png" },
  { id: "binancecoin",  name: "BNB",      symbol: "BNB",  thumb: "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png" },
  { id: "solana",       name: "Solana",   symbol: "SOL",  thumb: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png" },
  { id: "ripple",       name: "XRP",      symbol: "XRP",  thumb: "https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png" },
];

const SwapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
  </svg>
);

export default function Converter() {
  const currency = useSelector((s) => s.currency.current);
  const [fromCoin, setFromCoin]   = useState(POPULAR[0]);
  const [toCoin, setToCoin]       = useState(POPULAR[1]);
  const [amount, setAmount]       = useState("1");
  const [prices, setPrices]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch]       = useState({ from: "", to: "" });
  const [results, setResults]     = useState({ from: [], to: [] });
  const [activeSide, setActiveSide] = useState(null);

  const fetchPrices = useCallback(async () => {
    const ids = [...new Set([fromCoin.id, toCoin.id])];
    setLoading(true);
    try {
      const coins = await coingeckoAPI.getCoinsByIds(ids, currency.code);
      const map = {};
      coins.forEach((c) => { map[c.id] = c.price; });
      setPrices(map);
      setLastUpdated(new Date());
    } catch {}
    finally { setLoading(false); }
  }, [fromCoin.id, toCoin.id, currency.code]);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const handleSearch = async (side, q) => {
    setSearch((s) => ({ ...s, [side]: q }));
    if (q.length < 2) { setResults((r) => ({ ...r, [side]: [] })); return; }
    try {
      const coins = await coingeckoAPI.searchCoins(q);
      setResults((r) => ({ ...r, [side]: coins }));
    } catch { setResults((r) => ({ ...r, [side]: [] })); }
  };

  const selectCoin = (side, coin) => {
    const c = { id: coin.id, name: coin.name, symbol: coin.symbol?.toUpperCase(), thumb: coin.thumb };
    if (side === "from") setFromCoin(c); else setToCoin(c);
    setSearch((s) => ({ ...s, [side]: "" }));
    setResults((r) => ({ ...r, [side]: [] }));
    setActiveSide(null);
  };

  const swap = () => {
    const tmp = fromCoin;
    setFromCoin(toCoin);
    setToCoin(tmp);
  };

  const fromPrice = prices[fromCoin.id] ?? 0;
  const toPrice   = prices[toCoin.id]   ?? 0;
  const converted = toPrice > 0 ? (parseFloat(amount || 0) * fromPrice) / toPrice : 0;
  const rate      = toPrice > 0 ? fromPrice / toPrice : 0;
  const rateInv   = fromPrice > 0 ? toPrice / fromPrice : 0;

  const CoinPicker = ({ side, coin }) => (
    <div style={{ flex: 1, position: "relative" }}>
      {/* Selected coin display */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 16px", background: "var(--bg-primary)",
        border: `1px solid ${activeSide === side ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 12, marginBottom: 8, cursor: "pointer",
        transition: "border-color 0.2s",
      }} onClick={() => setActiveSide(activeSide === side ? null : side)}>
        <img src={coin.thumb} alt={coin.name} style={{ width: 32, height: 32, borderRadius: "50%" }}
          onError={(e) => e.target.style.display = "none"} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{coin.symbol}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{coin.name}</div>
        </div>
        {!loading && prices[coin.id] != null && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              {formatPrice(prices[coin.id], currency.symbol)}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Current price</div>
          </div>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--text-muted)", transform: activeSide === side ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Search input — shows when dropdown is open */}
      {activeSide === side && (
        <div style={{ position: "absolute", top: "calc(100% - 4px)", left: 0, right: 0, zIndex: 20, background: "var(--bg-card)", border: "1px solid var(--accent)", borderRadius: 12, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.35)" }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
            <input
              autoFocus
              value={search[side]}
              onChange={(e) => handleSearch(side, e.target.value)}
              placeholder="Search coins..."
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit" }}
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {results[side].length === 0 && search[side].length >= 2 && (
              <div style={{ padding: "14px", color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>No results</div>
            )}
            {results[side].length === 0 && search[side].length < 2 && (
              POPULAR.map((c) => (
                <div key={c.id} onClick={() => selectCoin(side, c)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <img src={c.thumb} alt={c.name} style={{ width: 26, height: 26, borderRadius: "50%" }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{c.symbol}</span>
                </div>
              ))
            )}
            {results[side].map((c) => (
              <div key={c.id} onClick={() => selectCoin(side, c)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <img src={c.thumb} alt={c.name} style={{ width: 26, height: 26, borderRadius: "50%" }} onError={(e) => e.target.style.display = "none"} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{c.symbol?.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowsIcon size={22} color="var(--accent)" />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Crypto Converter</h1>
          </div>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Real-time conversion between any two cryptocurrencies
        </p>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
        {/* Amount input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Amount
          </label>
          <input
            type="number" step="any" min="0" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "100%", padding: "14px 18px",
              background: "var(--bg-primary)", border: "1px solid var(--border)",
              borderRadius: 12, color: "var(--text-primary)",
              fontSize: 24, fontWeight: 800, outline: "none",
              fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border)"}
          />
        </div>

        {/* Coin pickers + swap */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <CoinPicker side="from" coin={fromCoin} />

          <button
            onClick={swap}
            style={{
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 12, color: "var(--accent)", cursor: "pointer",
              padding: "14px 14px", marginTop: 4, transition: "all 0.2s", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.1)"}
            title="Swap coins"
          >
            <SwapIcon />
          </button>

          <CoinPicker side="to" coin={toCoin} />
        </div>

        {/* Result box */}
        <div style={{
          marginTop: 28, padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03))",
          border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, textAlign: "center",
        }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text-muted)", fontSize: 14, padding: "8px 0" }}>
              <div style={{ width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              Fetching live prices...
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                {amount || 0} <strong style={{ color: "var(--text-secondary)" }}>{fromCoin.symbol}</strong> equals
              </div>
              <div style={{ fontSize: 38, fontWeight: 800, color: "var(--accent)", marginBottom: 12, letterSpacing: "-1px" }}>
                {converted.toLocaleString("en-US", { maximumFractionDigits: 8 })}
                <span style={{ fontSize: 18, fontWeight: 600, marginLeft: 8, color: "var(--text-secondary)" }}>{toCoin.symbol}</span>
              </div>

              {/* Exchange rates */}
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "6px 14px", borderRadius: 20 }}>
                  1 {fromCoin.symbol} = <strong style={{ color: "var(--text-secondary)" }}>
                    {rate.toLocaleString("en-US", { maximumFractionDigits: 8 })} {toCoin.symbol}
                  </strong>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", padding: "6px 14px", borderRadius: 20 }}>
                  1 {toCoin.symbol} = <strong style={{ color: "var(--text-secondary)" }}>
                    {rateInv.toLocaleString("en-US", { maximumFractionDigits: 8 })} {fromCoin.symbol}
                  </strong>
                </div>
              </div>

              {/* Value in selected currency */}
              {fromPrice > 0 && (
                <div style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>
                  ≈ <strong style={{ color: "var(--text-secondary)" }}>
                    {formatPrice(parseFloat(amount || 0) * fromPrice, currency.symbol)}
                  </strong> {currency.label}
                </div>
              )}
            </>
          )}
        </div>

        {/* Last updated + refresh */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchPrices}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)",
              background: "transparent", color: "var(--accent)", fontSize: 12, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
              opacity: loading ? 0.5 : 1, marginLeft: "auto",
            }}
          >
            <RefreshIcon size={12} color="var(--accent)" spinning={loading} />
            Refresh rates
          </button>
        </div>

        {/* Popular quick-select */}
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Quick select (from)
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {POPULAR.map((c) => (
              <button
                key={c.id}
                onClick={() => setFromCoin(c)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 20, border: "1px solid",
                  borderColor: fromCoin.id === c.id ? "var(--accent)" : "var(--border)",
                  background: fromCoin.id === c.id ? "rgba(99,102,241,0.12)" : "transparent",
                  color: fromCoin.id === c.id ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                <img src={c.thumb} alt={c.symbol} style={{ width: 16, height: 16, borderRadius: "50%" }} onError={(e) => e.target.style.display = "none"} />
                {c.symbol}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
