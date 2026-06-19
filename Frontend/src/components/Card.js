import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToWatchlist, removeFromWatchlist, optimisticAdd, optimisticRemove } from "../store/watchlistSlice";
import { useToast } from "./ui/Toast";
import { formatPrice, formatChange, formatLarge } from "../utils/format";
import Sparkline from "./Sparkline";

const Card = memo(({ coin }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { coinIds } = useSelector((s) => s.watchlist);
  const { user } = useSelector((s) => s.auth);
  const currency = useSelector((s) => s.currency.current);
  const isWatched = coinIds.includes(coin.id);
  const isPositive = (coin.change ?? 0) >= 0;

  const handleStar = useCallback((e) => {
    e.stopPropagation();
    if (!user) { toast("Login to manage your watchlist", "warning"); return; }
    if (isWatched) {
      dispatch(optimisticRemove(coin.id));
      dispatch(removeFromWatchlist(coin.id));
      toast(`${coin.name} removed`, "info");
    } else {
      dispatch(optimisticAdd(coin.id));
      dispatch(addToWatchlist(coin.id));
      toast(`${coin.name} added to watchlist`, "success");
    }
  }, [user, isWatched, coin.id, coin.name, dispatch, toast]);

  return (
    <div
      onClick={() => navigate(`/coin/${coin.id}`)}
      className="fade-in"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${isWatched ? "rgba(99,102,241,0.35)" : "var(--border)"}`,
        borderRadius: 18, padding: "18px 18px 14px",
        cursor: "pointer", transition: "all 0.22s ease", position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.18)";
        e.currentTarget.style.background = "var(--bg-card-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isWatched ? "rgba(99,102,241,0.35)" : "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.background = "var(--bg-card)";
      }}
    >
      {isWatched && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, var(--accent), #818cf8)",
        }} />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img src={coin.image} alt={coin.name} style={{ width: 40, height: 40, borderRadius: "50%", display: "block" }}
            onError={(e) => { e.target.style.display = "none"; }} />
          {coin.rank && (
            <div style={{
              position: "absolute", bottom: -2, right: -2,
              background: "var(--bg-primary)", border: "1px solid var(--border)",
              borderRadius: 5, fontSize: 9, fontWeight: 700,
              color: "var(--text-muted)", padding: "1px 3px", lineHeight: 1.4,
            }}>#{coin.rank}</div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {coin.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{coin.symbol}</div>
        </div>
        <button
          onClick={handleStar}
          title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
          style={{
            background: isWatched ? "rgba(99,102,241,0.12)" : "transparent",
            border: `1px solid ${isWatched ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
            borderRadius: 8, cursor: "pointer",
            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s", flexShrink: 0, padding: 0,
          }}
        >
          {isWatched
            ? <img src={coin.image} alt="" style={{ width: 16, height: 16, borderRadius: "50%" }} />
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
          }
        </button>
      </div>

      {/* Price + sparkline row */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            {formatPrice(coin.price, currency.symbol)}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: isPositive ? "var(--green-bg)" : "var(--red-bg)",
              color: isPositive ? "var(--green)" : "var(--red)",
            }}>
              {isPositive ? "▲" : "▼"} {formatChange(coin.change)}
            </span>
            {coin.change7d != null && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                background: "rgba(255,255,255,0.05)", color: "var(--text-muted)",
              }}>
                7D: {formatChange(coin.change7d)}
              </span>
            )}
          </div>
        </div>
        {coin.sparkline && (
          <Sparkline data={coin.sparkline} isPositive={isPositive} width={80} height={40} />
        )}
      </div>

      {/* Market cap */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
        MCap: {formatLarge(coin.marketCap, currency.symbol)}
      </div>
    </div>
  );
});

export default Card;
