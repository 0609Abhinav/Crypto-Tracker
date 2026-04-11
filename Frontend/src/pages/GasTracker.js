import React, { useState, useEffect, useCallback } from "react";
import { getGasPrice } from "../services/gas";
import { coingeckoAPI } from "../services/coingecko";

const SPEEDS = [
  { key: "slow",     label: "🐢 Slow",     desc: "~5 min",  color: "#10b981" },
  { key: "standard", label: "🚶 Standard", desc: "~2 min",  color: "#f59e0b" },
  { key: "fast",     label: "🚀 Fast",     desc: "< 30 sec", color: "#6366f1" },
];

export default function GasTracker() {
  const [gas, setGas] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [loading, setLoading] = useState(true);
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
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [load]);

  // Estimate tx cost: gas limit * gwei * eth price
  const estimateCost = (gwei, gasLimit = 21000) => {
    if (!gwei || !ethPrice) return null;
    const ethCost = (parseFloat(gwei) * gasLimit * 1e-9);
    return (ethCost * ethPrice).toFixed(4);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>⛽ Gas Tracker</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Ethereum network gas prices — updated every 30 seconds</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastUpdated && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
          <button onClick={load} disabled={loading} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.5 : 1 }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading && !gas ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : !gas ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Gas data unavailable</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Could not fetch gas prices. Try again in a moment.</p>
          <button onClick={load} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
        </div>
      ) : (
        <>
          {/* Gas speed cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
            {SPEEDS.map(({ key, label, desc, color }) => {
              const gwei = gas[key]?.gwei;
              const usdCost = estimateCost(gwei);
              return (
                <div key={key} style={{ background: "var(--bg-card)", border: `1px solid ${color}30`, borderRadius: 16, padding: "22px 24px" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>{desc}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color, marginBottom: 4 }}>
                    {gwei ?? "—"} <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>Gwei</span>
                  </div>
                  {usdCost && (
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      ~${usdCost} for ETH transfer
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ETH price */}
          {ethPrice && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <img src="https://assets.coingecko.com/coins/images/279/thumb/ethereum.png" alt="ETH" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>ETH Price (used for cost estimates)</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>${ethPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          )}

          {/* Common tx cost table */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.025)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Common Transaction Costs</span>
            </div>
            {[
              { label: "ETH Transfer", gasLimit: 21000 },
              { label: "ERC-20 Transfer", gasLimit: 65000 },
              { label: "Uniswap Swap", gasLimit: 150000 },
              { label: "NFT Mint", gasLimit: 200000 },
              { label: "Contract Deploy", gasLimit: 500000 },
            ].map(({ label, gasLimit }) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 1fr)", gap: 12, padding: "13px 20px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 1fr)", gap: 12, padding: "10px 20px", background: "rgba(255,255,255,0.02)" }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Speed</span>
              {SPEEDS.map(({ key, label, color }) => (
                <span key={key} style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
