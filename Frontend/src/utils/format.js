// Pass currency symbol for display — defaults to $ (USD)
export const formatPrice = (n, symbol = "$") => {
  if (n == null) return "N/A";
  if (n >= 1) return `${symbol}${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 0.01) return `${symbol}${Number(n).toFixed(4)}`;
  return `${symbol}${Number(n).toFixed(8)}`;
};

export const formatLarge = (n, symbol = "$") => {
  if (n == null || isNaN(n)) return "N/A";
  if (n >= 1e12) return `${symbol}${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `${symbol}${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `${symbol}${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3)  return `${symbol}${(n / 1e3).toFixed(2)}K`;
  return `${symbol}${Number(n).toLocaleString()}`;
};

export const formatChange = (n) => {
  if (n == null) return "N/A";
  return `${n > 0 ? "+" : ""}${Number(n).toFixed(2)}%`;
};

export const formatSupply = (n) => {
  if (!n) return "∞";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return Number(n).toLocaleString();
};
