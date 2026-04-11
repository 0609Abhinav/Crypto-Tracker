import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarket } from "../store/marketSlice";
import { useNavigate } from "react-router-dom";
import { formatChange } from "../utils/format";

function getColor(change) {
  if (change == null) return "#1f2937";
  if (change >= 10)  return "#065f46";
  if (change >= 5)   return "#047857";
  if (change >= 2)   return "#059669";
  if (change >= 0)   return "#10b981";
  if (change >= -2)  return "#ef4444";
  if (change >= -5)  return "#dc2626";
  if (change >= -10) return "#b91c1c";
  return "#7f1d1d";
}

function HeatmapTile({ coin, size }) {
  const navigate = useNavigate();
  const fontSize = size > 120 ? 14 : size > 80 ? 12 : 10;
  const showPrice = size > 90;
  const showSymbol = size > 50;

  return (
    <div
      onClick={() => navigate(`/coin/${coin.id}`)}
      title={`${coin.name}: ${formatChange(coin.change)}`}
      style={{
        width: size, height: size,
        background: getColor(coin.change),
        borderRadius: 8, cursor: "pointer",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 4, transition: "opacity 0.2s, transform 0.15s",
        border: "1px solid rgba(0,0,0,0.3)",
        overflow: "hidden", flexShrink: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.zIndex = "10"; e.currentTarget.style.position = "relative"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.zIndex = "0"; }}
    >
      {coin.image && size > 60 && (
        <img src={coin.image} alt={coin.name} style={{ width: size > 100 ? 24 : 16, height: size > 100 ? 24 : 16, borderRadius: "50%", marginBottom: 4 }} onError={(e) => e.target.style.display = "none"} />
      )}
      {showSymbol && <div style={{ fontSize, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>{coin.symbol}</div>}
      {showPrice && <div style={{ fontSize: fontSize - 1, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{formatChange(coin.change)}</div>}
    </div>
  );
}

export default function Heatmap() {
  const dispatch = useDispatch();
  const { coins, loading } = useSelector((s) => s.market);
  const currency = useSelector((s) => s.currency.current);

  useEffect(() => {
    dispatch(fetchMarket({ currency: currency.code }));
  }, [dispatch, currency.code]);

  // Size tiles by market cap rank
  const sized = coins.slice(0, 100).map((c, i) => {
    const size = i < 5 ? 160 : i < 15 ? 120 : i < 30 ? 90 : i < 60 ? 70 : 52;
    return { ...c, tileSize: size };
  });

  const legend = [
    { label: "> +10%", color: "#065f46" },
    { label: "+5%", color: "#047857" },
    { label: "+2%", color: "#059669" },
    { label: "+0%", color: "#10b981" },
    { label: "-2%", color: "#ef4444" },
    { label: "-5%", color: "#dc2626" },
    { label: "-10%", color: "#b91c1c" },
    { label: "< -10%", color: "#7f1d1d" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>🗺 Market Heatmap</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Top 100 coins by market cap — colored by 24h price change</p>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginRight: 4 }}>24h change:</span>
        {legend.map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignContent: "flex-start" }}>
          {sized.map((coin) => (
            <HeatmapTile key={coin.id} coin={coin} size={coin.tileSize} />
          ))}
        </div>
      )}
    </div>
  );
}
