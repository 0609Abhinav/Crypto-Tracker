import React, { useState, useEffect, useCallback, useRef } from "react";
import { coingeckoAPI } from "../services/coingecko";
import { ChartSkeleton } from "./ui/Skeletons";

const RANGES = [
  { label: "24H", days: 1 },
  { label: "7D",  days: 7 },
  { label: "30D", days: 30 },
  { label: "1Y",  days: 365 },
];

const CHART_TYPES = [
  { key: "candle", label: "Candles" },
  { key: "area",   label: "Area" },
];

const C = {
  green:    "#26a69a",
  red:      "#ef5350",
  grid:     "#1f2937",
  axis:     "#6b7280",
  bg:       "#111827",
  border:   "#1f2937",
  accent:   "#6366f1",
  volGreen: "rgba(38,166,154,0.5)",
  volRed:   "rgba(239,83,80,0.5)",
};

function fmtP(v, sym) {
  if (v == null) return "—";
  if (v >= 1) return sym + v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return sym + v.toFixed(6);
}

function CandleTooltip({ candle, x, y, symbol }) {
  if (!candle) return null;
  const isUp = candle.close >= candle.open;
  return (
    <div style={{
      position: "absolute", left: x + 12, top: Math.max(4, y - 60),
      background: "#0d1117", border: "1px solid " + (isUp ? C.green : C.red),
      borderRadius: 8, padding: "8px 12px", pointerEvents: "none",
      zIndex: 10, minWidth: 160, fontSize: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
    }}>
      <div style={{ color: C.axis, marginBottom: 4, fontWeight: 600 }}>{candle.time}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px" }}>
        {[["O", candle.open], ["H", candle.high], ["L", candle.low], ["C", candle.close]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 4 }}>
            <span style={{ color: C.axis }}>{k}</span>
            <span style={{ color: isUp ? C.green : C.red, fontWeight: 700 }}>{fmtP(v, symbol)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CandlestickCanvas({ data, width, height, volHeight, currency, chartType }) {
  const canvasRef  = useRef(null);
  const metaRef    = useRef({ slots: [] });
  const [tooltip,  setTooltip]  = useState(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  const chartH = height - volHeight - 8;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const PAD = { top: 12, right: 8, bottom: 20, left: 72 };
    const ctx  = canvas.getContext("2d");
    const dpr  = window.devicePixelRatio || 1;
    canvas.width        = width  * dpr;
    canvas.height       = height * dpr;
    canvas.style.width  = width  + "px";
    canvas.style.height = height + "px";
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const plotW    = width  - PAD.left - PAD.right;
    const plotH    = chartH - PAD.top  - PAD.bottom;
    const volPlotH = volHeight - 4;
    const n        = data.length;
    const prices   = data.flatMap((d) => [d.high, d.low]);
    const priceMin = Math.min(...prices) * 0.999;
    const priceMax = Math.max(...prices) * 1.001;
    const volMax   = Math.max(...data.map((d) => d.volume || 0)) * 1.05 || 1;
    const toY      = (p) => PAD.top + plotH - ((p - priceMin) / (priceMax - priceMin)) * plotH;
    const candleW  = Math.max(1, Math.floor(plotW / n) - 1);
    const candleX  = (i) => PAD.left + (i / n) * plotW + (plotW / n - candleW) / 2;

    metaRef.current.slots = data.map((_, i) => ({ x: PAD.left + (i / n) * plotW, w: plotW / n }));

    // Grid + price labels
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 0.5;
    for (let g = 0; g <= 5; g++) {
      const p = priceMin + (g / 5) * (priceMax - priceMin);
      const y = toY(p);
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(width - PAD.right, y); ctx.stroke();
      ctx.fillStyle = C.axis;
      ctx.font      = "10px Inter,sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(fmtP(p, currency.symbol), PAD.left - 4, y + 3);
    }

    // X labels
    ctx.fillStyle  = C.axis;
    ctx.font       = "10px Inter,sans-serif";
    ctx.textAlign  = "center";
    const step = Math.max(1, Math.floor(n / 8));
    data.forEach((d, i) => {
      if (i % step === 0) ctx.fillText(d.time, candleX(i) + candleW / 2, height - 4);
    });

    if (chartType === "area") {
      const areaColor = data[data.length - 1]?.close >= data[0]?.close ? C.green : C.red;
      const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + plotH);
      grad.addColorStop(0, areaColor + "44");
      grad.addColorStop(1, areaColor + "00");
      ctx.beginPath();
      data.forEach((d, i) => {
        const x = candleX(i) + candleW / 2;
        i === 0 ? ctx.moveTo(x, toY(d.close)) : ctx.lineTo(x, toY(d.close));
      });
      ctx.lineTo(candleX(n - 1) + candleW / 2, PAD.top + plotH);
      ctx.lineTo(candleX(0)     + candleW / 2, PAD.top + plotH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      data.forEach((d, i) => {
        const x = candleX(i) + candleW / 2;
        i === 0 ? ctx.moveTo(x, toY(d.close)) : ctx.lineTo(x, toY(d.close));
      });
      ctx.strokeStyle = areaColor;
      ctx.lineWidth   = 2;
      ctx.stroke();
    } else {
      data.forEach((d, i) => {
        const isUp  = d.close >= d.open;
        const color = isUp ? C.green : C.red;
        const cx    = candleX(i) + candleW / 2;
        if (i === hoverIdx) {
          ctx.fillStyle = "rgba(255,255,255,0.05)";
          ctx.fillRect(candleX(i) - 1, PAD.top, candleW + 2, plotH);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(cx, toY(d.high));
        ctx.lineTo(cx, toY(d.low));
        ctx.stroke();
        const bodyTop = toY(Math.max(d.open, d.close));
        const bodyH   = Math.max(1, toY(Math.min(d.open, d.close)) - bodyTop);
        ctx.fillStyle = color;
        ctx.fillRect(candleX(i), bodyTop, candleW, bodyH);
      });
    }

    // Volume bars
    data.forEach((d, i) => {
      const barH = ((d.volume || 0) / volMax) * volPlotH;
      ctx.fillStyle = d.close >= d.open ? C.volGreen : C.volRed;
      ctx.fillRect(candleX(i), chartH + volPlotH - barH, candleW, barH);
    });

    ctx.fillStyle  = C.axis;
    ctx.font       = "10px Inter,sans-serif";
    ctx.textAlign  = "left";
    ctx.fillText("VOL", PAD.left + 4, chartH + 12);

    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, chartH);
    ctx.lineTo(width - PAD.right, chartH);
    ctx.stroke();
  }, [data, width, height, volHeight, chartH, hoverIdx, chartType, currency]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;
    const idx  = metaRef.current.slots.findIndex((s) => mx >= s.x && mx < s.x + s.w);
    if (idx >= 0 && idx < data.length) {
      setHoverIdx(idx);
      setTooltip({ candle: data[idx], x: mx, y: my });
    } else {
      setHoverIdx(null);
      setTooltip(null);
    }
  }, [data]);

  const handleMouseLeave = useCallback(() => { setHoverIdx(null); setTooltip(null); }, []);

  return (
    <div style={{ position: "relative", width, height }}>
      <canvas ref={canvasRef} style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
      {tooltip && <CandleTooltip candle={tooltip.candle} x={tooltip.x} y={tooltip.y} symbol={currency.symbol} />}
    </div>
  );
}

function ResponsiveChart({ data, currency, chartType }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((e) => setWidth(e[0].contentRect.width));
    ro.observe(containerRef.current);
    setWidth(containerRef.current.offsetWidth);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {width > 0 && <CandlestickCanvas data={data} width={width} height={360} volHeight={80} currency={currency} chartType={chartType} />}
    </div>
  );
}

const PriceChart = ({ coinId, currency = { code: "usd", symbol: "$" } }) => {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);
  const [range,     setRange]     = useState(RANGES[1]);
  const [chartType, setChartType] = useState("candle");

  const fetchChart = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const ohlc = await coingeckoAPI.getCoinOHLC(coinId, range.days, currency.code);
      let volumes = {};
      try {
        const mc = await coingeckoAPI.getCoinChart(coinId, range.days, currency.code);
        mc.total_volumes?.forEach(([ts, v]) => { volumes[Math.floor(ts / 60000)] = v; });
      } catch {}
      const fmt  = (ts) => new Date(ts).toLocaleDateString("en-US", {
        month: "short", day: "numeric",
        ...(range.days === 1 ? { hour: "2-digit", minute: "2-digit" } : {}),
      });
      const s = Math.max(1, Math.floor(ohlc.length / 120));
      setData(ohlc.filter((_, i) => i % s === 0).map(([ts, o, h, l, c]) => ({
        time: fmt(ts), open: o, high: h, low: l, close: c,
        volume: volumes[Math.floor(ts / 60000)] ?? 0,
      })));
    } catch {
      try {
        const mc  = await coingeckoAPI.getCoinChart(coinId, range.days, currency.code);
        const raw = mc.prices;
        const s   = Math.max(1, Math.floor(raw.length / 120));
        setData(raw.filter((_, i) => i % s === 0).map(([ts, p], i, arr) => {
          const prev = arr[i - 1]?.[1] ?? p;
          return { time: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }), open: prev, high: Math.max(prev, p), low: Math.min(prev, p), close: p, volume: 0 };
        }));
      } catch { setError(true); }
    } finally { setLoading(false); }
  }, [coinId, range.days, currency.code]);

  useEffect(() => { fetchChart(); }, [fetchChart]);

  if (loading) return <ChartSkeleton />;

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 20px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {CHART_TYPES.map((t) => (
            <button key={t.key} onClick={() => setChartType(t.key)} style={{
              padding: "4px 12px", borderRadius: 6, border: "1px solid",
              borderColor: chartType === t.key ? C.accent : C.border,
              background:  chartType === t.key ? "rgba(99,102,241,0.15)" : "transparent",
              color:       chartType === t.key ? C.accent : C.axis,
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {RANGES.map((r) => (
            <button key={r.label} onClick={() => setRange(r)} style={{
              padding: "4px 12px", borderRadius: 6, border: "1px solid",
              borderColor: range.label === r.label ? C.accent : C.border,
              background:  range.label === r.label ? "rgba(99,102,241,0.15)" : "transparent",
              color:       range.label === r.label ? C.accent : C.axis,
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>{r.label}</button>
          ))}
        </div>
      </div>
      {error ? (
        <div style={{ height: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: C.axis }}>
          <span style={{ fontSize: 32 }}>📉</span>
          <span style={{ fontSize: 14 }}>Chart data unavailable</span>
          <button onClick={fetchChart} style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid " + C.border, background: "transparent", color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
        </div>
      ) : (
        <ResponsiveChart data={data} currency={currency} chartType={chartType} />
      )}
    </div>
  );
};

export default PriceChart;
