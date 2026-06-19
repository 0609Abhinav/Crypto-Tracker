import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarket } from "../store/marketSlice";
import { useNavigate } from "react-router-dom";
import { formatPrice, formatChange, formatLarge } from "../utils/format";
import { TableRowSkeleton } from "../components/ui/Skeletons";
import Sparkline from "../components/Sparkline";
import { TrendUpIcon, TrendDownIcon, ArrowUpIcon, ArrowDownIcon } from "../components/Icons";

const TIMEFRAMES = [
  { key: "change",   label: "24H" },
  { key: "change7d", label: "7D" },
  { key: "change30d",label: "30D" },
];

const CoinRow = ({ coin, rank, currencySymbol, timeframe }) => {
  const navigate = useNavigate();
  const change = coin[timeframe] ?? coin.change ?? 0;
  const isPos  = change >= 0;
  return (
    <div
      onClick={() => navigate(`/coin/${coin.id}`)}
      style={{
        display: "grid", gridTemplateColumns: "36px 2fr 1fr 1fr 1fr 90px",
        gap: 12, padding: "13px 20px", alignItems: "center",
        borderBottom: "1px solid var(--border)", cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textAlign: "center",
        background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "2px 0", display: "block" }}>
        {rank}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img src={coin.image} alt={coin.name} style={{ width: 32, height: 32, borderRadius: "50%" }}
            onError={(e) => e.target.style.display = "none"} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{coin.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{coin.symbol}</div>
        </div>
      </div>
      <span style={{ fontWeight: 700, fontSize: 14 }}>{formatPrice(coin.price, currencySymbol)}</span>
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: isPos ? "var(--green)" : "var(--red)",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <span style={{ display: "inline-flex" }}>
          {isPos ? <ArrowUpIcon size={12} color="var(--green)" /> : <ArrowDownIcon size={12} color="var(--red)" />}
        </span>
        {formatChange(change)}
      </span>
      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatLarge(coin.marketCap, currencySymbol)}</span>
      <Sparkline data={coin.sparkline} isPositive={isPos} width={90} height={36} />
    </div>
  );
};

const TableHeader = ({ timeframe }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "36px 2fr 1fr 1fr 1fr 90px",
    gap: 12, padding: "10px 20px",
    borderBottom: "1px solid var(--border)",
    background: "rgba(255,255,255,0.02)",
  }}>
    {["#", "Name", "Price", `${timeframe.toUpperCase()} %`, "Market Cap", "7D Chart"].map((h) => (
      <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
    ))}
  </div>
);

export default function GainersLosers() {
  const dispatch = useDispatch();
  const { coins, loading } = useSelector((s) => s.market);
  const currency = useSelector((s) => s.currency.current);
  const [timeframe, setTimeframe] = useState("change");

  useEffect(() => {
    dispatch(fetchMarket({ currency: currency.code }));
  }, [dispatch, currency.code]);

  const sorted = useMemo(() => {
    return [...coins].filter((c) => c[timeframe] != null);
  }, [coins, timeframe]);

  const gainers = useMemo(() => [...sorted].sort((a, b) => b[timeframe] - a[timeframe]).slice(0, 20), [sorted, timeframe]);
  const losers  = useMemo(() => [...sorted].sort((a, b) => a[timeframe] - b[timeframe]).slice(0, 20), [sorted, timeframe]);

  // Summary stats
  const totalGainers = coins.filter((c) => (c[timeframe] ?? 0) > 0).length;
  const totalLosers  = coins.filter((c) => (c[timeframe] ?? 0) < 0).length;
  const avgGain = gainers.length ? (gainers.reduce((s, c) => s + (c[timeframe] ?? 0), 0) / gainers.length).toFixed(2) : 0;
  const avgLoss = losers.length  ? (losers.reduce((s, c)  => s + (c[timeframe] ?? 0), 0) / losers.length).toFixed(2)  : 0;
  const tfLabel = TIMEFRAMES.find((t) => t.key === timeframe)?.label || "24H";

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                <polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800 }}>Gainers &amp; Losers</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>Top movers in the last {tfLabel}</p>
            </div>
          </div>

          {/* Timeframe toggle */}
          <div style={{ display: "flex", gap: 4, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: 4 }}>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                style={{
                  padding: "6px 16px", borderRadius: 7, border: "none",
                  background: timeframe === tf.key ? "var(--accent)" : "transparent",
                  color: timeframe === tf.key ? "#fff" : "var(--text-secondary)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && coins.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          {[
            { label: "Gainers", value: totalGainers, color: "var(--green)", bg: "var(--green-bg)", Icon: TrendUpIcon },
            { label: "Losers",  value: totalLosers,  color: "var(--red)",   bg: "var(--red-bg)", Icon: TrendDownIcon },
            { label: `Avg ${tfLabel} Gain`, value: `+${avgGain}%`, color: "var(--green)", bg: "var(--green-bg)", Icon: TrendUpIcon },
            { label: `Avg ${tfLabel} Loss`, value: `${avgLoss}%`,  color: "var(--red)",   bg: "var(--red-bg)", Icon: TrendDownIcon },
          ].map(({ label, value, color, bg, Icon }) => (
            <div key={label} style={{ padding: "10px 18px", borderRadius: 10, background: bg, border: `1px solid ${color}30`, display: "flex", gap: 8, alignItems: "center" }}>
              <Icon size={14} color={color} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}:</span>
              <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Gainers */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>Top Gainers</h2>
            <TrendUpIcon size={14} color="var(--green)" />
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>{gainers.length} coins</span>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 20px rgba(16,185,129,0.04)" }}>
            <TableHeader timeframe={tfLabel} />
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} />)
              : gainers.map((c, i) => <CoinRow key={c.id} coin={c} rank={i + 1} currencySymbol={currency.symbol} timeframe={timeframe} />)
            }
          </div>
        </div>

        {/* Losers */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)" }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--red)" }}>Top Losers</h2>
            <TrendDownIcon size={14} color="var(--red)" />
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>{losers.length} coins</span>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 20px rgba(239,68,68,0.04)" }}>
            <TableHeader timeframe={tfLabel} />
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} />)
              : losers.map((c, i) => <CoinRow key={c.id} coin={c} rank={i + 1} currencySymbol={currency.symbol} timeframe={timeframe} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
}
