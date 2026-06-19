import React, { useEffect, useState } from "react";
import { coingeckoAPI } from "../services/coingecko";
import { formatLarge } from "../utils/format";

export default function GlobalStatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    coingeckoAPI.getGlobal().then(setStats).catch(() => {});
  }, []);

  if (!stats) return null;

  const totalMcap  = stats.total_market_cap?.usd;
  const totalVol   = stats.total_volume?.usd;
  const btcDom     = stats.market_cap_percentage?.btc?.toFixed(1);
  const ethDom     = stats.market_cap_percentage?.eth?.toFixed(1);
  const coins      = stats.active_cryptocurrencies?.toLocaleString();
  const mcapChange = stats.market_cap_change_percentage_24h_usd?.toFixed(2);
  const isUp       = parseFloat(mcapChange) >= 0;

  const items = [
    {
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      label: "Coins", value: coins,
    },
    {
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
      label: "Market Cap", value: formatLarge(totalMcap),
      sub: mcapChange != null ? `${isUp ? "▲" : "▼"} ${Math.abs(mcapChange)}%` : null,
      subColor: isUp ? "var(--green)" : "var(--red)",
    },
    {
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        </svg>
      ),
      label: "24h Volume", value: formatLarge(totalVol),
    },
    {
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
      label: "BTC Dom.", value: `${btcDom}%`, valueColor: "#f59e0b",
    },
    {
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#627eea" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 19 22 19"/>
        </svg>
      ),
      label: "ETH Dom.", value: `${ethDom}%`, valueColor: "#627eea",
    },
  ];

  return (
    <div style={{
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border)",
      padding: "5px 20px",
      overflowX: "auto",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 20,
        fontSize: 11.5, color: "var(--text-muted)",
        whiteSpace: "nowrap",
      }}>
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 0 2px rgba(16,185,129,0.25)", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--text-muted)" }}>Live</span>
        </div>

        <div style={{ width: 1, height: 14, background: "var(--border)" }} />

        {items.map(({ icon, label, value, sub, subColor, valueColor }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: "var(--text-muted)", opacity: 0.7 }}>{icon}</span>
            <span>{label}:</span>
            <span style={{ color: valueColor || "var(--text-secondary)", fontWeight: 700 }}>{value}</span>
            {sub && <span style={{ color: subColor, fontWeight: 700, fontSize: 11 }}>{sub}</span>}
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
