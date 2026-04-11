// Ethereum gas prices via Etherscan public API (no key needed for basic endpoint)
// Falls back to a simple estimation if unavailable
export const getGasPrice = async () => {
  try {
    const res = await fetch("https://api.etherscan.io/api?module=gastracker&action=gasoracle");
    if (!res.ok) throw new Error("Gas API unavailable");
    const data = await res.json();
    if (data.status !== "1") throw new Error("Gas data unavailable");
    return {
      slow:    { gwei: Number(data.result.SafeGasPrice),    usd: null },
      standard:{ gwei: Number(data.result.ProposeGasPrice), usd: null },
      fast:    { gwei: Number(data.result.FastGasPrice),    usd: null },
    };
  } catch {
    // Fallback: fetch from owlracle (no key, public)
    try {
      const res = await fetch("https://api.owlracle.info/v4/eth/gas?accept=90");
      if (!res.ok) throw new Error();
      const d = await res.json();
      const speeds = d.speeds || [];
      return {
        slow:     { gwei: speeds[0]?.maxFeePerGas?.toFixed(1) ?? "—", usd: null },
        standard: { gwei: speeds[1]?.maxFeePerGas?.toFixed(1) ?? "—", usd: null },
        fast:     { gwei: speeds[2]?.maxFeePerGas?.toFixed(1) ?? "—", usd: null },
      };
    } catch {
      return null;
    }
  }
};
