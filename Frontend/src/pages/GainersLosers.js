import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarket } from "../store/marketSlice";
import { useNavigate } from "react-router-dom";
import { formatPrice, formatChange, formatLarge } from "../utils/format";
import { TableRowSkeleton } from "../components/ui/Skeletons";
import Sparkline from "../components/Sparkline";

const CoinRow = ({ coin, rank, currencySymbol }) => {
  const navigate = useNavigate();
  const isPos = (coin.change ?? 0) >= 0;
  return (
    <div
      onClick={() => navigate(`/coin/${coin.id}`)}
      style={{
        display: "grid", gridTemplateColumns: "32px 2fr 1fr 1fr 1fr 90px",
        gap: 16, padding: "13px 20px", alignItems: "center",
        borderBottom: "1px solid var(--border)", cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{rank}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={coin.image} alt={coin.name} style={{ width: 30, height: 30, borderRadius: "50%" }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{coin.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{coin.symbol}</div>
        </div>
      </div>
      <span style={{ fontWeight: 700, fontSize: 14 }}>{formatPrice(coin.price, currencySymbol)}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: isPos ? "var(--green)" : "var(--red)" }}>
        {isPos ? "▲" : "▼"} {formatChange(coin.change)}
      </span>
      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatLarge(coin.marketCap, currencySymbol)}</span>
      <Sparkline data={coin.sparkline} isPositive={isPos} width={90} height={36} />
    </div>
  );
};

export default function GainersLosers() {
  const dispatch = useDispatch();
  const { coins, loading } = useSelector((s) => s.market);
  const currency = useSelector((s) => s.currency.current);

  useEffect(() => {
    dispatch(fetchMarket({ currency: currency.code }));
  }, [dispatch, currency.code]);

  const gainers = [...coins].filter((c) => c.change != null).sort((a, b) => b.change - a.change).slice(0, 20);
  const losers = [...coins].filter((c) => c.change != null).sort((a, b) => a.change - b.change).slice(0, 20);

  const TableHeader = () => (
    <div style={{
      display: "grid", gridTemplateColumns: "32px 2fr 1fr 1fr 1fr 90px",
      gap: 16, padding: "10px 20px",
      borderBottom: "1px solid var(--border)",
      background: "rgba(255,255,255,0.02)",
    }}>
      {["#", "Name", "Price", "24h %", "Market Cap", "7D Chart"].map((h) => (
        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📊 Gainers & Losers</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Top movers in the last 24 hours</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Gainers */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            ▲ Top Gainers
          </h2>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            <TableHeader />
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} />)
              : gainers.map((c, i) => <CoinRow key={c.id} coin={c} rank={i + 1} currencySymbol={currency.symbol} />)
            }
          </div>
        </div>

        {/* Losers */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--red)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            ▼ Top Losers
          </h2>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            <TableHeader />
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} />)
              : losers.map((c, i) => <CoinRow key={c.id} coin={c} rank={i + 1} currencySymbol={currency.symbol} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
}
