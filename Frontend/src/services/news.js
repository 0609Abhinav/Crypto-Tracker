// Crypto news via public APIs — no key required

// GNews.io has a free tier but requires key.
// Best free option: fetch directly from public RSS via allorigins CORS proxy
// and parse XML ourselves — completely free, no limits

const PROXY = "https://api.allorigins.win/get?url=";

const FEEDS = {
  all:        "https://cointelegraph.com/rss",
  BTC:        "https://cointelegraph.com/rss/tag/bitcoin",
  ETH:        "https://cointelegraph.com/rss/tag/ethereum",
  DeFi:       "https://cointelegraph.com/rss/tag/defi",
  NFT:        "https://cointelegraph.com/rss/tag/nft",
  Regulation: "https://cointelegraph.com/rss/tag/regulation",
};

// Fallback feeds if CoinTelegraph is blocked
const FALLBACK_FEEDS = [
  "https://decrypt.co/feed",
  "https://bitcoinmagazine.com/.rss/full/",
];

const parseXML = (xml, sourceName) => {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return items.slice(0, 18).map((m, i) => {
    const raw = m[1];

    const getTag = (tag) => {
      const r = raw.match(new RegExp(
        `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
        "i"
      ));
      return r ? (r[1] || r[2] || "").trim() : "";
    };

    // Extract image from various RSS formats
    const imgSrc =
      (raw.match(/url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i)?.[1]) ||
      (raw.match(/<media:content[^>]+url="([^"]+)"/i)?.[1]) ||
      (raw.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1]) ||
      (raw.match(/<img[^>]+src="([^"]+)"/i)?.[1]) ||
      null;

    const title = getTag("title");
    const link  = getTag("link") || raw.match(/<link>([^<]+)<\/link>/)?.[1]?.trim() || "";
    const desc  = getTag("description")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);
    const pubDate = getTag("pubDate");

    if (!title || !link) return null;

    return {
      id: getTag("guid") || link || String(i),
      title,
      body: desc,
      url: link,
      imageurl: imgSrc,
      source: sourceName,
      source_info: { name: sourceName },
      published_on: pubDate
        ? Math.floor(new Date(pubDate).getTime() / 1000)
        : Math.floor(Date.now() / 1000),
    };
  }).filter(Boolean);
};

const fetchFeed = async (feedUrl) => {
  const url = `${PROXY}${encodeURIComponent(feedUrl)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
  const json = await res.json();
  if (!json.contents) throw new Error("Empty response from proxy");
  // Detect source name from feed URL
  const source = feedUrl.includes("cointelegraph") ? "CoinTelegraph"
    : feedUrl.includes("decrypt") ? "Decrypt"
    : feedUrl.includes("bitcoinmagazine") ? "Bitcoin Magazine"
    : "Crypto News";
  return parseXML(json.contents, source);
};

export const getNews = async (category = "all") => {
  const primaryFeed = FEEDS[category] || FEEDS.all;

  // Try primary feed
  try {
    const articles = await fetchFeed(primaryFeed);
    if (articles.length > 0) return articles;
  } catch {
    // fall through to fallbacks
  }

  // Try fallback feeds
  for (const feed of FALLBACK_FEEDS) {
    try {
      const articles = await fetchFeed(feed);
      if (articles.length > 0) return articles;
    } catch {
      continue;
    }
  }

  return [];
};

export const getCoinNews = (symbol) => getNews(symbol);
