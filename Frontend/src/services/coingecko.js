const BASE = process.env.REACT_APP_COINGECKO_URL;

const get = async (path, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(`${BASE}${path}`, { headers: { accept: "application/json" } });
    if (res.status === 429) {
      if (i < retries) { await new Promise((r) => setTimeout(r, 2000 * (i + 1))); continue; }
      throw new Error("Rate limited by CoinGecko. Please wait a moment.");
    }
    if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
    return res.json();
  }
};

export const normalizeCoin = (c) => ({
  id: c.id,
  name: c.name,
  symbol: c.symbol?.toUpperCase(),
  image: c.image || c.thumb || c.large,
  price: c.current_price ?? c.data?.price ?? null,
  change: c.price_change_percentage_24h ?? c.data?.price_change_percentage_24h?.usd ?? null,
  change7d: c.price_change_percentage_7d_in_currency ?? null,
  marketCap: c.market_cap ?? c.data?.market_cap ?? null,
  volume: c.total_volume ?? c.data?.total_volume ?? null,
  high24h: c.high_24h ?? null,
  low24h: c.low_24h ?? null,
  rank: c.market_cap_rank ?? null,
  ath: c.ath ?? null,
  athChangePercentage: c.ath_change_percentage ?? null,
  circulatingSupply: c.circulating_supply ?? null,
  totalSupply: c.total_supply ?? null,
  sparkline: c.sparkline_in_7d?.price ?? null,
});

export const coingeckoAPI = {
  // currency param wires up to the currency switcher
  getMarkets: (page = 1, currency = "usd") =>
    get(`/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=${page}&sparkline=true&price_change_percentage=7d`)
      .then((list) => list.map(normalizeCoin)),

  getCoinsByIds: (ids, currency = "usd") => {
    if (!ids.length) return Promise.resolve([]);
    return get(`/coins/markets?vs_currency=${currency}&ids=${ids.join(",")}&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=7d`)
      .then((list) => list.map(normalizeCoin));
  },

  getTrending: () =>
    get(`/search/trending`).then((res) =>
      res.coins.map((c) => normalizeCoin({
        id: c.item.id, name: c.item.name, symbol: c.item.symbol,
        image: c.item.thumb,
        current_price: c.item.data?.price,
        price_change_percentage_24h: c.item.data?.price_change_percentage_24h?.usd,
        market_cap: c.item.data?.market_cap,
        total_volume: c.item.data?.total_volume,
        market_cap_rank: c.item.market_cap_rank,
      }))
    ),

  getGlobal: () => get(`/global`).then((r) => r.data),

  getCoinById: (id, currency = "usd") =>
    get(`/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`),

  getCoinChart: (id, days, currency = "usd") =>
    get(`/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`),

  getCoinOHLC: (id, days, currency = "usd") =>
    get(`/coins/${id}/ohlc?vs_currency=${currency}&days=${days}`),

  getCoinTickers: (id) =>
    new Promise((resolve) => setTimeout(resolve, 1200))
      .then(() => get(`/coins/${id}/tickers?include_exchange_logo=true&depth=false&order=volume_desc`))
      .then((r) => r.tickers?.slice(0, 10) ?? [])
      .catch(() => []),

  searchCoins: (query) =>
    get(`/search?query=${encodeURIComponent(query)}`).then((r) => r.coins?.slice(0, 8) ?? []),
};
