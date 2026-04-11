// Free API — no key needed
export const getFearGreed = async () => {
  const res = await fetch("https://api.alternative.me/fng/?limit=7");
  if (!res.ok) throw new Error("Fear & Greed fetch failed");
  const data = await res.json();
  return data.data; // array of { value, value_classification, timestamp }
};
