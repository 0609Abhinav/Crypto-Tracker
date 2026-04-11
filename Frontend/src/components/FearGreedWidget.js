import React, { useEffect, useState } from "react";
import { getFearGreed } from "../services/feargreed";

const getColor = (val) => {
  if (val <= 25) return "#ef4444";
  if (val <= 45) return "#f97316";
  if (val <= 55) return "#f59e0b";
  if (val <= 75) return "#84cc16";
  return "#10b981";
};

const getLabel = (val) => {
  if (val <= 25) return "Extreme Fear";
  if (val <= 45) return "Fear";
  if (val <= 55) return "Neutral";
  if (val <= 75) return "Greed";
  return "Extreme Greed";
};

export default function FearGreedWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getFearGreed().then(setData).catch(() => {});
  }, []);

  if (!data?.[0]) return null;

  const current = data[0];
  const val = parseInt(current.value);
  const color = getColor(val);
  const label = getLabel(val);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (val / 100) * circumference;

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 16, padding: "20px 24px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1 }}>
        Fear & Greed Index
      </div>

      {/* Gauge */}
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color }}>{val}</span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          {new Date(parseInt(current.timestamp) * 1000).toLocaleDateString()}
        </div>
      </div>

      {/* 7-day history */}
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {data.slice(0, 7).reverse().map((d, i) => {
          const v = parseInt(d.value);
          return (
            <div
              key={i}
              title={`${v} — ${getLabel(v)}`}
              style={{
                width: 8, height: 28, borderRadius: 4,
                background: getColor(v), opacity: 0.7 + (i / 7) * 0.3,
              }}
            />
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>7-day history</div>
    </div>
  );
}
