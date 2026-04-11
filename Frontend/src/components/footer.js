import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const col = (title, links) => (
    <div key={title}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>{title}</div>
      {links.map(([label, to]) => (
        <div key={to} style={{ marginBottom: 9 }}>
          <Link to={to} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
            onMouseEnter={(e) => e.target.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}
          >{label}</Link>
        </div>
      ))}
    </div>
  );

  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "48px 20px 28px", marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 40, marginBottom: 40 }}>
          <div style={{ maxWidth: 260 }}>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 10 }}>
              Coin<span style={{ color: "var(--accent)" }}>Pulse</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.7 }}>
              Real-time crypto prices, market data, news, and portfolio tracking — all free.
            </p>
            <div style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)" }}>
              Data powered by <a href="https://coingecko.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>CoinGecko</a>
            </div>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {col("Markets", [["Market", "/market"], ["Trending", "/trending"], ["Gainers & Losers", "/gainers"], ["News", "/news"]])}
            {col("Account", [["Login", "/login"], ["Sign Up", "/signup"], ["Watchlist", "/watchlist"], ["Profile", "/profile"]])}
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>© {new Date().getFullYear()} CoinPulse. All rights reserved.</span>
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Not financial advice. DYOR.</span>
        </div>
      </div>
    </footer>
  );
}
