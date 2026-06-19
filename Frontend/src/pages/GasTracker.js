import React, { useState, useEffect, useCallback } from "react";
import { getGasPrice } from "../services/gas";
import { coingeckoAPI } from "../services/coingecko";
import { RefreshIcon } from "../components/Icons";

const SPEEDS = [
  { key: "slow",     label: "Slow",     desc: "~5 min",   color: "#10b981",
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c4.97 0 9-4.03 9-9S16.97 4 12 4 3 8.03 3 13s4.03 9 9 9z"/>
        <polyline points="12 8 12 13 15 16"/>
      </svg>
    )
  },
  { key: "standard", label: "Standard", desc: "~2 min",   color: "#f59e0b",
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )
  },
  { key: "fast",     label: "Fast",     desc: "< 30 sec", color: "#6366f1",
    Icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <line x1="13" y1="16" x2="17" y2="16"/>
      </svg>
    )
  },
];

const GAS_LIMIT_ROWS = [
  { label: "ETH Transfer",    gasLimit: 21000  },
  { label: "ERC-20 Transfer", gasLimit: 65000  },
  { label: "Uniswap Swap",    gasLimit: 150000 },
  { label: "NFT Mint",        gasLimit: 200000 },
  { label: "Contract Deploy", gasLimit: 500000 },
];

export default function GasTracker() {
  const [gas,         setGas]         = useState(null);
  const [ethPrice,    setEthPrice]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [gasData, ethData] = await Promise.allSettled([
      getGasPrice(),
      coingeckoAPI.getCoinsByIds(["ethereum"], "usd"),
    ]);
    if (gasData.status === "fulfilled") setGas(gasData.value);
    if (ethData.status === "fulfilled") setEthPrice(ethData.value?.[0]?.price ?? null);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const estimateCost = (gwei, gasLimit = 21000) => {
    if (!gwei || !ethPrice) return null;
    const ethCost = (parseFloat(gwei) * gasLimit * 1e-9);
    return (ethCost * ethPrice).toFixed(4);
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 22V10l6-8 6 8v12H3z"/><line x1="3" y1="14" x2="15" y2="14"/>
                <path d="M16 9h2a2 2 0 012 2v8a1 1 0 002 0v-5l-3-3"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800 }}>Gas Tracker</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Ethereum network gas prices — live</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastUpdated && (
            <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button onClick={load} disabled={loading} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)",
            background: "transparent", color: "var(--accent)", fontSize: 13, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            opacity: loading ? 0.5 : 1, transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <RefreshIcon size={13} color="var(--accent)" spinning={loading} />
            Refresh
          </button>
        </div>
      </div>

      {loading && !gas ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : !gas ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Gas data unavailable</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Could not fetch gas prices. Try again in a moment.</p>
          <button onClick={load} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
        </div>
      ) : (
        <>
          {/* Gas speed cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
            {SPEEDS.map(({ key, label, desc, color, Icon }) => {
              const gwei    = gas[key]?.gwei;
              const usdCost = estimateCost(gwei);
              const maxGwei = Math.max(...SPEEDS.map((s) => parseFloat(gas[s.key]?.gwei) || 0)) || 1;
              const pct     = gwei ? (parseFloat(gwei) / maxGwei) * 100 : 0;
              return (
                <div key={key} style={{ background: "var(--bg-card)", border: `1px solid ${color}35`, borderRadius: 16, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, opacity: 0.7, borderRadius: "16px 16px 0 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color }}>
                      <Icon />
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 11, background: `${color}20`, color, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{desc}</span>
                  </div>
                  <div style={{ fontSize: 34, fontWeight: 800, color, marginBottom: 8, marginTop: 12 }}>
                    {gwei ?? "—"} <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>Gwei</span>
                  </div>
                  <div style={{ height: 5, background: "var(--border)", borderRadius: 2.5, marginBottom: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: 2.5, transition: "width 0.5s" }} />
                  </div>
                  {usdCost && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      ~<strong style={{ color: "var(--text-secondary)" }}>${usdCost}</strong> per ETH transfer
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ETH price chip */}
          {ethPrice && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <img src="https://assets.coingecko.com/coins/images/279/thumb/ethereum.png" alt="ETH" style={{ width: 28, height: 28, borderRadius: "50%" }} />
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>ETH Price (used for cost estimates)</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>${ethPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.2)", fontWeight: 600 }}>LIVE</span>
            </div>
          )}

          {/* Common tx cost table */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.025)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Common Transaction Costs</span>
              <div style={{ display: "flex", gap: 16 }}>
                {SPEEDS.map(({ key, label, color }) => (
                  <span key={key} style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
                ))}
              </div>
            </div>
            {GAS_LIMIT_ROWS.map(({ label, gasLimit }) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 100px)", gap: 12, padding: "13px 20px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                {SPEEDS.map(({ key, color }) => {
                  const cost = estimateCost(gas[key]?.gwei, gasLimit);
                  return (
                    <span key={key} style={{ fontSize: 13, fontWeight: 600, color }}>
                      {cost ? `$${cost}` : "—"}
                    </span>
                  );
                })}
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 100px)", gap: 12, padding: "11px 20px", background: "rgba(255,255,255,0.015)" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Gas limit</span>
              {GAS_LIMIT_ROWS.map(({ gasLimit }, i) => i === 0 && (
                <span key={gasLimit} style={{ fontSize: 11, color: "var(--text-muted)" }}>{gasLimit.toLocaleString()} units</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
