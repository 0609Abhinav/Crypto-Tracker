import React, { useState, useEffect, useCallback } from "react";
import { coingeckoAPI } from "../services/coingecko";
import { useSelector } from "react-redux";
import { formatPrice } from "../utils/format";

const POPULAR = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", thumb: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", thumb: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png" },
  { id: "tether", name: "Tether", symbol: "USDT", thumb: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png" },
  { id: "binancecoin", name: "BNB", symbol: "BNB", thumb: "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png" },
  { id: "solana", name: "Solana", symbol: "SOL", thumb: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png" },
  { id: "ripple", name: "XRP", symbol: "XRP", thumb: "https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png" },
];

export default function Converter() {
  const currency = useSelector((s) => s.currency.current);
  const [fromCoin, setFromCoin] = useState(POPULAR[0]);
  const [toCoin, setToCoin] = useState(POPULAR[1]);
  const [amount, setAmount] = useState("1");
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({ from: "", to: "" });
  const [results, setResults] = useState({ from: [], to: [] });

  const fetchPrices = useCallback(async () => {
    const ids = [...new Set([fromCoin.id, toCoin.id])];
    setLoading(true);
    try {
      const coins = await coingeckoAPI.getCoinsByIds(ids, currency.code);
      const map = {};
      coins.forEach((c) => { map[c.id] = c.price; });
      setPrices(map);
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
  };

  const swap = () => { setFromCoin(toCoin); setToCoin(fromCoin); };

  const fromPrice = prices[fromCoin.id] ?? 0;
  const toPrice = prices[toCoin.id] ?? 0;
  const converted = toPrice > 0 ? (parseFloat(amount || 0) * fromPrice) / toPrice : 0;
  const rate = toPrice > 0 ? fromPrice / toPrice : 0;

  const CoinPicker = ({ side, coin }) => (
    <div style={{ flex: 1, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: 8 }}>
        <img src={coin.thumb} alt={coin.name} style={{ width: 28, height: 28, borderRadius: "50%" }} onError={(e) => e.target.style.display = "none"} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{coin.symbol}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{coin.name}</div>
        </div>
        {!loading && prices[coin.id] && (
          <div style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
            {formatPrice(prices[coin.id], currency.symbol)}
          </div>
        )}
      </div>
      <input value={search[side]} onChange={(e) => handleSearch(side, e.target.value)} placeholder="Change coin..." style={{ width: "100%", padding: "8px 12px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
      {results[side].length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, zIndex: 10, maxHeight: 180, overflowY: "auto", marginTop: 4 }}>
          {results[side].map((c) => (
            <div key={c.id} onClick={() => selectCoin(side, c)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <img src={c.thumb} alt={c.name} style={{ width: 22, height: 22, borderRadius: "50%" }} onError={(e) => e.target.style.display = "none"} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.symbol?.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>🔄 Crypto Converter</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Convert between any two cryptocurrencies instantly</p>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
        {/* Amount input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Amount</label>
          <input type="number" step="any" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: "100%", padding: "14px 18px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)", fontSize: 22, fontWeight: 700, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
        </div>

        {/* Coin pickers */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <CoinPicker side="from" coin={fromCoin} />
          <button onClick={swap} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, color: "var(--accent)", cursor: "pointer", fontSize: 18, padding: "10px 14px", marginTop: 8, transition: "all 0.2s", flexShrink: 0 }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.1)"}>
            ⇄
          </button>
          <CoinPicker side="to" coin={toCoin} />
        </div>

        {/* Result */}
        <div style={{ marginTop: 28, padding: "20px 24px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, textAlign: "center" }}>
          {loading ? (
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Fetching prices...</div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                {amount || 0} {fromCoin.symbol} =
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent)", marginBottom: 8 }}>
                {converted.toLocaleString("en-US", { maximumFractionDigits: 8 })} {toCoin.symbol}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                1 {fromCoin.symbol} = {rate.toLocaleString("en-US", { maximumFractionDigits: 8 })} {toCoin.symbol}
              </div>
            </>
          )}
        </div>

        {/* Popular quick-select */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Popular</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {POPULAR.map((c) => (
              <button key={c.id} onClick={() => setFromCoin(c)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid", borderColor: fromCoin.id === c.id ? "var(--accent)" : "var(--border)", background: fromCoin.id === c.id ? "rgba(99,102,241,0.1)" : "transparent", color: fromCoin.id === c.id ? "var(--accent)" : "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
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
