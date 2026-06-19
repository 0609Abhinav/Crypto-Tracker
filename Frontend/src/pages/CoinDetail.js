import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { coingeckoAPI } from "../services/coingecko";
import { addToWatchlist, removeFromWatchlist, optimisticAdd, optimisticRemove } from "../store/watchlistSlice";
import { useToast } from "../components/ui/Toast";
import PriceChart from "../components/PriceChart";
import { CoinDetailSkeleton } from "../components/ui/Skeletons";
import { formatPrice, formatChange, formatLarge, formatSupply } from "../utils/format";
import Button from "../components/ui/Button";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import {
  ArrowLeftIcon, StarIcon, StarFilledIcon,
  GlobeIcon, TwitterIcon, GithubIcon, MessageSquareIcon,
  ExternalLinkIcon, RefreshIcon, ScaleIcon,
} from "../components/Icons";

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: "var(--bg-card)", border: "1px solid var(--border)",
    borderRadius: 12, padding: "16px 20px",
  }}>
    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {label}
    </div>
    <div style={{ fontSize: 17, fontWeight: 700, color: color || "var(--text-primary)" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
  </div>
);

// 52-week price range bar
const PriceRangeBar = ({ low, high, current, symbol }) => {
  if (!low || !high || !current) return null;
  const pct = Math.max(0, Math.min(100, ((current - low) / (high - low)) * 100));
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
        52-Week Range
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--red)", whiteSpace: "nowrap" }}>{formatPrice(low, symbol)}</div>
        <div style={{ flex: 1, position: "relative" }}>
          {/* Track */}
          <div style={{ height: 6, borderRadius: 3, background: "linear-gradient(90deg, var(--red), var(--yellow), var(--green))", position: "relative" }}>
            {/* Marker */}
            <div style={{
              position: "absolute", top: "50%", left: `${pct}%`,
              width: 14, height: 14, borderRadius: "50%",
              background: "var(--text-primary)", border: "2px solid var(--bg-primary)",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }} />
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", whiteSpace: "nowrap" }}>{formatPrice(high, symbol)}</div>
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
        Current: <strong style={{ color: "var(--text-secondary)" }}>{formatPrice(current, symbol)}</strong>
        &nbsp;·&nbsp;{pct.toFixed(1)}% of 52-week range
      </div>
    </div>
  );
};

function DescriptionBlock({ name, html }) {
  const [expanded, setExpanded] = useState(false);
  const plain   = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const preview = plain.slice(0, 400);
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>About {name}</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.75 }}>
        {expanded ? plain : `${preview}${plain.length > 400 ? "..." : ""}`}
      </p>
      {plain.length > 400 && (
        <button onClick={() => setExpanded((e) => !e)} style={{
          marginTop: 12, background: "none", border: "none",
          color: "var(--accent)", fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}
    </div>
  );
}

function CoinLinks({ coin }) {
  const links = [];
  if (coin.links?.homepage?.[0])                links.push({ label: "Website", url: coin.links.homepage[0],           Icon: GlobeIcon });
  if (coin.links?.twitter_screen_name)          links.push({ label: "Twitter", url: `https://twitter.com/${coin.links.twitter_screen_name}`, Icon: TwitterIcon });
  if (coin.links?.subreddit_url)                links.push({ label: "Reddit",  url: coin.links.subreddit_url,         Icon: MessageSquareIcon });
  if (coin.links?.repos_url?.github?.[0])       links.push({ label: "GitHub",  url: coin.links.repos_url.github[0],  Icon: GithubIcon });
  if (!links.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
        Links &amp; Resources
      </h3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {links.map(({ label, url, Icon }) => (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", textDecoration: "none",
            fontSize: 13, fontWeight: 600, transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <Icon size={14} color="currentColor" />
            {label}
            <ExternalLinkIcon size={11} color="currentColor" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Exchange tickers ─────────────────────────────────────────────────────────

function ExchangeTickers({ coinId }) {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coingeckoAPI.getCoinTickers(coinId)
      .then(setTickers)
      .catch(() => setTickers([]))
      .finally(() => setLoading(false));
  }, [coinId]);

  if (!loading && !tickers.length) return null;

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginTop: 20 }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.025)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Top Markets
        </h3>
      </div>
      {loading ? (
        <div style={{ padding: 20 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 40, marginBottom: 8, borderRadius: 8 }} />
          ))}
        </div>
      ) : (
        <>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, padding: "10px 24px", background: "rgba(255,255,255,0.015)", borderBottom: "1px solid var(--border)" }}>
            {["Exchange", "Pair", "Price (USD)", "Volume"].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
            ))}
          </div>
          {tickers.slice(0, 8).map((t, i) => (
            <a key={i} href={t.trade_url} target="_blank" rel="noopener noreferrer"
              style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, padding: "12px 24px", borderBottom: "1px solid var(--border)", textDecoration: "none", transition: "background 0.12s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {t.market?.logo && <img src={t.market.logo} alt={t.market.name} style={{ width: 20, height: 20, borderRadius: 4 }} onError={(e) => e.target.style.display = "none"} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{t.market?.name}</span>
              </div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t.base}/{t.target}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>${t.converted_last?.usd?.toLocaleString("en-US", { maximumFractionDigits: 6 }) ?? "—"}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>${t.converted_volume?.usd ? (t.converted_volume.usd / 1e6).toFixed(2) + "M" : "—"}</span>
            </a>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CoinDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const toast      = useToast();
  const { coinIds }  = useSelector((s) => s.watchlist);
  const { user }     = useSelector((s) => s.auth);
  const currency     = useSelector((s) => s.currency.current);
  const { addCoin }  = useRecentlyViewed();

  const [coin,       setCoin]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);

  const isWatched = coinIds.includes(id);

  const fetchCoin = useCallback(async () => {
    if (coin) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const data = await coingeckoAPI.getCoinById(id, currency.code);
      setCoin(data);
      const md = data.market_data;
      addCoin({
        id:     data.id,
        name:   data.name,
        symbol: data.symbol?.toUpperCase(),
        image:  data.image?.thumb,
        price:  md?.current_price?.[currency.code] ?? md?.current_price?.usd,
        change: md?.price_change_percentage_24h,
      });
    } catch (err) {
      setError(err.message || "Failed to load coin data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, currency.code, addCoin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchCoin(); }, [fetchCoin]);

  const handleWatchlist = () => {
    if (!user) { toast("Login to manage your watchlist", "warning"); return; }
    if (isWatched) {
      dispatch(optimisticRemove(id));
      dispatch(removeFromWatchlist(id));
      toast(`${coin?.name} removed from watchlist`, "info");
    } else {
      dispatch(optimisticAdd(id));
      dispatch(addToWatchlist(id));
      toast(`${coin?.name} added to watchlist`, "success");
    }
  };

  if (loading) return <CoinDetailSkeleton />;

  if (error) return (
    <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: 20 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--red-bg)", border: "1px solid var(--red)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{error}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Button onClick={fetchCoin}>Retry</Button>
        <Button variant="ghost" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );

  if (!coin) return null;

  const md         = coin.market_data ?? {};
  const cur        = currency.code;
  const price      = md.current_price?.[cur];
  const change24h  = md.price_change_percentage_24h;
  const change7d   = md.price_change_percentage_7d;
  const change30d  = md.price_change_percentage_30d;
  const marketCap  = md.market_cap?.[cur];
  const volume     = md.total_volume?.[cur];
  const high       = md.high_24h?.[cur];
  const low        = md.low_24h?.[cur];
  const ath        = md.ath?.[cur];
  const athChange  = md.ath_change_percentage?.[cur];
  const atl        = md.atl?.[cur];
  const high52w    = md.ath?.[cur];
  const low52w     = md.atl?.[cur];
  const circulatingSupply = md.circulating_supply;
  const totalSupply       = md.total_supply;
  const fdv               = md.fully_diluted_valuation?.[cur];
  const isPositive        = (change24h ?? 0) >= 0;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }} className="fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{
        background: "none", border: "none", color: "var(--text-muted)",
        cursor: "pointer", fontSize: 14, marginBottom: 24,
        fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
        transition: "color 0.2s",
      }}
        onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
      >
        <ArrowLeftIcon size={16} color="currentColor" />
        Back
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={coin.image?.large} alt={coin.name} style={{ width: 64, height: 64, borderRadius: "50%", flexShrink: 0, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800 }}>{coin.name}</h1>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                {coin.symbol?.toUpperCase()}
              </span>
              {coin.market_cap_rank && (
                <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: "var(--accent)", border: "1px solid rgba(99,102,241,0.3)" }}>
                  Rank #{coin.market_cap_rank}
                </span>
              )}
              {refreshing && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent)", fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", marginLeft: 4 }}>
                  <RefreshIcon size={11} color="var(--accent)" spinning />
                  Updating...
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 30, fontWeight: 800 }}>{formatPrice(price, currency.symbol)}</span>
              <span style={{ fontSize: 14, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: isPositive ? "var(--green-bg)" : "var(--red-bg)", color: isPositive ? "var(--green)" : "var(--red)" }}>
                {isPositive ? "▲" : "▼"} {formatChange(change24h)} 24h
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {[["7D", change7d], ["30D", change30d]].map(([label, val]) => val != null && (
                <span key={label} style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: val >= 0 ? "var(--green-bg)" : "var(--red-bg)", color: val >= 0 ? "var(--green)" : "var(--red)" }}>
                  {label}: {formatChange(val)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            variant={isWatched ? "success" : "primary"}
            onClick={handleWatchlist}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {isWatched ? <StarFilledIcon size={14} color="currentColor" /> : <StarIcon size={14} color="currentColor" />}
            {isWatched ? "Watching" : "Add to Watchlist"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(`/compare?coins=${id}`)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <ScaleIcon size={14} color="currentColor" />
            Compare
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Market Cap"        value={formatLarge(marketCap, currency.symbol)} />
        <StatCard label="24h Volume"        value={formatLarge(volume, currency.symbol)} />
        <StatCard label="FDV"               value={formatLarge(fdv, currency.symbol)} />
        <StatCard label="24h High"          value={formatPrice(high, currency.symbol)} color="var(--green)" />
        <StatCard label="24h Low"           value={formatPrice(low, currency.symbol)}  color="var(--red)" />
        <StatCard label="All-Time High"     value={formatPrice(ath, currency.symbol)}  color="var(--green)"
          sub={athChange != null ? `${formatChange(athChange)} from ATH` : null} />
        <StatCard label="All-Time Low"      value={formatPrice(atl, currency.symbol)}  color="var(--red)" />
        <StatCard label="Circulating Supply" value={formatSupply(circulatingSupply)}
          sub={totalSupply ? `of ${formatSupply(totalSupply)} total` : null} />
      </div>

      {/* 52-week range bar */}
      <PriceRangeBar low={low52w} high={high52w} current={price} symbol={currency.symbol} />

      {/* Chart */}
      <div style={{ marginBottom: 28 }}>
        <PriceChart coinId={id} isPositive={isPositive} currency={currency} />
      </div>

      {/* Description */}
      {coin.description?.en && <DescriptionBlock name={coin.name} html={coin.description.en} />}

      {/* Links */}
      <CoinLinks coin={coin} />

      {/* Exchange tickers */}
      <ExchangeTickers coinId={id} />
    </div>
  );
}
