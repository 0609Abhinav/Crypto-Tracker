import React, { useEffect, useState } from "react";
import { coingeckoAPI } from "../services/coingecko";
import { formatLarge } from "../utils/format";

export default function GlobalStatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    coingeckoAPI.getGlobal()
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const totalMcap = stats.total_market_cap?.usd;
  const totalVol = stats.total_volume?.usd;
  const btcDom = stats.market_cap_percentage?.btc?.toFixed(1);
  const ethDom = stats.market_cap_percentage?.eth?.toFixed(1);
  const coins = stats.active_cryptocurrencies?.toLocaleString();
  const mcapChange = stats.market_cap_change_percentage_24h_usd?.toFixed(2);
  const isUp = mcapChange >= 0;

  const items = [
    { label: "Coins", value: coins },
    { label: "Market Cap", value: formatLarge(totalMcap), sub: mcapChange != null ? `${isUp ? "▲" : "▼"} ${Math.abs(mcapChange)}%` : null, subColor: isUp ? "var(--green)" : "var(--red)" },
    { label: "24h Volume", value: formatLarge(totalVol) },
    { label: "BTC Dom.", value: `${btcDom}%` },
    { label: "ETH Dom.", value: `${ethDom}%` },
  ];

  return (
    <div style={{
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border)",
      padding: "6px 20px",
      overflowX: "auto",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 24,
        fontSize: 12, color: "var(--text-muted)",
        whiteSpace: "nowrap",
      }}>
        {items.map(({ label, value, sub, subColor }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span>{label}:</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{value}</span>
            {sub && <span style={{ color: subColor, fontWeight: 600 }}>{sub}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
