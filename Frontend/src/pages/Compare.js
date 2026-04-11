import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { coingeckoAPI } from "../services/coingecko";
import { formatPrice, formatChange, formatLarge } from "../utils/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b"];
const RANGES = [{ label: "7D", days: 7 }, { label: "30D", days: 30 }, { label: "1Y", days: 365 }];
const MAX_COINS = 3;

const POPULAR = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", thumb: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", thumb: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png" },
  { id: "solana", name: "Solana", symbol: "SOL", thumb: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png" },
];

export default function Compare() {
  const currency = useSelector((s) => s.currency.current);
  const [coins, setCoins] = useState(POPULAR.slice(0, 2));
  const [chartData, setChartData] = useState([]);
  const [range, setRange] = useState(RANGES[0]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [liveData, setLiveData] = useState({});

  const fetchCharts = useCallback(async () => {
    if (!coins.length) return;
    setLoading(true);
    try {
      const series = await Promise.all(
        coins.map((c) => coingeckoAPI.getCoinChart(c.id, range.days, currency.code))
      );
      // Normalize to % change from start for fair comparison
      const normalized = series.map((s) => {
        const prices = s.prices;
        const base = prices[0]?.[1] ?? 1;
        return prices.map(([ts, p]) => ({ ts, pct: ((p - base) / base) * 100 }));
      });
      // Merge by index
      const len = Math.min(...normalized.map((n) => n.length));
      const step = Math.max(1, Math.floor(len / 80));
      const merged = [];
      for (let i = 0; i < len; i += step) {
        const point = { time: new Date(normalized[0][i].ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
        coins.forEach((c, ci) => { point[c.symbol] = parseFloat(normalized[ci][i]?.pct?.toFixed(2) ?? 0); });
        merged.push(point);
      }
      setChartData(merged);
    } catch {}
    finally { setLoading(false); }
  }, [coins, range.days, currency.code]);

  const fetchLive = useCallback(async () => {
    if (!coins.length) return;
    try {
      const data = await coingeckoAPI.getCoinsByIds(coins.map((c) => c.id), currency.code);
      const map = {};
      data.forEach((c) => { map[c.id] = c; });
      setLiveData(map);
    } catch {}
  }, [coins, currency.code]);

  useEffect(() => { fetchCharts(); fetchLive(); }, [fetchCharts, fetchLive]);

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    try { setResults(await coingeckoAPI.searchCoins(q)); }
    catch { setResults([]); }
  };

  const addCoin = (coin) => {
    if (coins.length >= MAX_COINS || coins.find((c) => c.id === coin.id)) return;
    setCoins((prev) => [...prev, { id: coin.id, name: coin.name, symbol: coin.symbol?.toUpperCase(), thumb: coin.thumb }]);
    setSearch(""); setResults([]);
  };

  const removeCoin = (id) => setCoins((prev) => prev.filter((c) => c.id !== id));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 10, padding: "10px 14px" }}>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
            {p.dataKey}: {p.value > 0 ? "+" : ""}{p.value}%
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>⚖️ Compare Coins</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Compare up to 3 coins side by side — % change from start of period</p>
      </div>

      {/* Coin selector */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
        {coins.map((c, i) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS[i]}`, background: `${COLORS[i]}18` }}>
            <img src={c.thumb} alt={c.name} style={{ width: 20, height: 20, borderRadius: "50%" }} onError={(e) => e.target.style.display = "none"} />
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS[i] }}>{c.symbol}</span>
            <button onClick={() => removeCoin(c.id)} style={{ background: "none", border: "none", color: COLORS[i], cursor: "pointer", fontSize: 14, padding: 0, opacity: 0.7 }}>✕</button>
          </div>
        ))}
        {coins.length < MAX_COINS && (
          <div style={{ position: "relative" }}>
            <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="+ Add coin..." style={{ padding: "8px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", width: 160 }} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
            {results.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, zIndex: 10, maxHeight: 200, overflowY: "auto", marginTop: 4, minWidth: 200 }}>
                {results.map((c) => (
                  <div key={c.id} onClick={() => addCoin(c)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <img src={c.thumb} alt={c.name} style={{ width: 20, height: 20, borderRadius: "50%" }} onError={(e) => e.target.style.display = "none"} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.symbol?.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Range selector */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {RANGES.map((r) => (
            <button key={r.label} onClick={() => setRange(r)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid", borderColor: range.label === r.label ? "var(--accent)" : "var(--border)", background: range.label === r.label ? "rgba(99,102,241,0.1)" : "transparent", color: range.label === r.label ? "var(--accent)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 28 }}>
        {loading ? (
          <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
              {coins.map((c, i) => (
                <Line key={c.id} type="monotone" dataKey={c.symbol} stroke={COLORS[i]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats comparison table */}
      {coins.length > 0 && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${coins.length}, 1fr)`, borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.025)" }}>
            <div style={{ padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Metric</div>
            {coins.map((c, i) => (
              <div key={c.id} style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <img src={c.thumb} alt={c.name} style={{ width: 20, height: 20, borderRadius: "50%" }} onError={(e) => e.target.style.display = "none"} />
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS[i] }}>{c.symbol}</span>
              </div>
            ))}
          </div>
          {[
            { label: "Price", key: (d) => formatPrice(d?.price, currency.symbol) },
            { label: "24h Change", key: (d) => formatChange(d?.change), color: (d) => (d?.change ?? 0) >= 0 ? "var(--green)" : "var(--red)" },
            { label: "7D Change", key: (d) => formatChange(d?.change7d), color: (d) => (d?.change7d ?? 0) >= 0 ? "var(--green)" : "var(--red)" },
            { label: "Market Cap", key: (d) => formatLarge(d?.marketCap, currency.symbol) },
            { label: "24h Volume", key: (d) => formatLarge(d?.volume, currency.symbol) },
            { label: "Rank", key: (d) => d?.rank ? `#${d.rank}` : "—" },
          ].map(({ label, key, color }) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: `180px repeat(${coins.length}, 1fr)`, borderBottom: "1px solid var(--border)" }}>
              <div style={{ padding: "13px 20px", fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
              {coins.map((c) => {
                const d = liveData[c.id];
                return (
                  <div key={c.id} style={{ padding: "13px 20px", fontSize: 13, fontWeight: 600, color: color ? color(d) : "var(--text-primary)" }}>
                    {d ? key(d) : "—"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
