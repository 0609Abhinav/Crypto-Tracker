import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { coingeckoAPI } from "../services/coingecko";
import { ChartSkeleton } from "./ui/Skeletons";
import { formatPrice } from "../utils/format";

const RANGES = [
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "1Y", days: 365 },
];

// Recharts can't read CSS variables — use resolved hex values
const COLORS = {
  positive: "#10b981",
  negative: "#ef4444",
  grid: "#1f2937",
  axis: "#6b7280",
  bg: "#111827",
  border: "#1f2937",
};

const CustomTooltip = ({ active, payload, label, currencySymbol }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: COLORS.bg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    }}>
      <div style={{ fontSize: 12, color: COLORS.axis, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#6366f1" }}>
        {formatPrice(payload[0].value, currencySymbol)}
      </div>
    </div>
  );
};

const PriceChart = ({ coinId, isPositive, currency = { code: "usd", symbol: "$" } }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState(RANGES[0]);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await coingeckoAPI.getCoinChart(coinId, range.days, currency.code);
      // Thin out data points for performance — max 120 points
      const raw = res.prices;
      const step = Math.max(1, Math.floor(raw.length / 120));
      const formatted = raw
        .filter((_, i) => i % step === 0)
        .map(([ts, price]) => ({
          time: new Date(ts).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            ...(range.days === 1 ? { hour: "2-digit", minute: "2-digit" } : {}),
          }),
          price,
        }));
      setData(formatted);
    } catch {
      setError(true);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [coinId, range.days, currency.code]);

  useEffect(() => { fetchChart(); }, [fetchChart]);

  const color = isPositive ? COLORS.positive : COLORS.negative;
  const gradientId = `grad-${coinId}-${range.label}`;

  if (loading) return <ChartSkeleton />;

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 16, padding: 24,
    }}>
      {/* Header row */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 20,
        flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
          Price Chart
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r)}
              style={{
                padding: "5px 14px", borderRadius: 8, border: "1px solid",
                borderColor: range.label === r.label ? "#6366f1" : COLORS.border,
                background: range.label === r.label ? "rgba(99,102,241,0.15)" : "transparent",
                color: range.label === r.label ? "#6366f1" : COLORS.axis,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s", fontFamily: "inherit",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div style={{
          height: 280, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
          color: COLORS.axis,
        }}>
          <span style={{ fontSize: 32 }}>📉</span>
          <span style={{ fontSize: 14 }}>Chart data unavailable</span>
          <button
            onClick={fetchChart}
            style={{
              padding: "6px 16px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
              background: "transparent", color: "#6366f1", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: COLORS.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: COLORS.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                `${currency.symbol}${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v >= 1 ? v.toFixed(2) : v.toFixed(4)}`
              }
              width={75}
            />
            <Tooltip content={<CustomTooltip currencySymbol={currency.symbol} />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PriceChart;
