import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPortfolio, addHolding, removeHolding } from "../store/portfolioSlice";
import { coingeckoAPI } from "../services/coingecko";
import { formatPrice, formatChange } from "../utils/format";
import { useToast } from "../components/ui/Toast";
import Button from "../components/ui/Button";
import { TrashIcon, PlusIcon, DownloadIcon, TrendUpIcon, TrendDownIcon, BarChart2Icon, BriefcaseIcon, XIcon } from "../components/Icons";

const EMPTY_FORM = { coinId: "", coinName: "", coinSymbol: "", coinImage: "", quantity: "", buyPrice: "", buyDate: "", notes: "" };

function AddHoldingModal({ onClose, onAdd, currency }) {
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [search,    setSearch]    = useState("");
  const [results,   setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const coins = await coingeckoAPI.searchCoins(q);
      setResults(coins);
    } catch { setResults([]); }
    finally { setSearching(false); }
  };

  const selectCoin = async (coin) => {
    setSearch(coin.name);
    setResults([]);
    try {
      const [data] = await coingeckoAPI.getCoinsByIds([coin.id], currency.code);
      setForm((f) => ({ ...f, coinId: coin.id, coinName: coin.name, coinSymbol: coin.symbol?.toUpperCase(), coinImage: coin.thumb || "", buyPrice: data?.price?.toString() || "" }));
    } catch {
      setForm((f) => ({ ...f, coinId: coin.id, coinName: coin.name, coinSymbol: coin.symbol?.toUpperCase(), coinImage: coin.thumb || "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.coinId || !form.quantity || !form.buyPrice) return;
    setLoading(true);
    await onAdd({ ...form, quantity: parseFloat(form.quantity), buyPrice: parseFloat(form.buyPrice) });
    setLoading(false);
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    background: "var(--bg-primary)", border: "1px solid var(--border)",
    borderRadius: 10, color: "var(--text-primary)", fontSize: 14,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PlusIcon size={18} color="var(--accent)" />
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>Add Holding</h2>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-muted)", cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <XIcon size={14} color="currentColor" />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Coin search */}
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Coin *</label>
            <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search coin..." style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
            {(results.length > 0 || searching) && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, zIndex: 10, maxHeight: 200, overflowY: "auto", marginTop: 4 }}>
                {searching ? <div style={{ padding: 12, color: "var(--text-muted)", fontSize: 13 }}>Searching...</div>
                  : results.map((c) => (
                    <div key={c.id} onClick={() => selectCoin(c)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <img src={c.thumb} alt={c.name} style={{ width: 22, height: 22, borderRadius: "50%" }} onError={(e) => e.target.style.display = "none"} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.symbol?.toUpperCase()}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Quantity *</label>
              <input type="number" step="any" min="0" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="0.00" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Buy Price ({currency.symbol}) *</label>
              <input type="number" step="any" min="0" value={form.buyPrice} onChange={(e) => setForm((f) => ({ ...f, buyPrice: e.target.value }))} placeholder="0.00" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Buy Date</label>
            <input type="date" value={form.buyDate} onChange={(e) => setForm((f) => ({ ...f, buyDate: e.target.value }))} style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Notes</label>
            <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional note..." style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Button type="submit" loading={loading} style={{ flex: 1 }}>Add Holding</Button>
            <Button variant="ghost" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── P&L mini bar ─────────────────────────────────────────────────────────────
const PnLBar = ({ pnlPct, isProfit }) => {
  const pct = Math.min(Math.abs(pnlPct), 100);
  return (
    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: isProfit ? "var(--green)" : "var(--red)", borderRadius: 2, transition: "width 0.6s" }} />
    </div>
  );
};

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportPortfolioCSV(holdings, prices, currencyLabel) {
  const header = ["Coin", "Symbol", "Quantity", `Buy Price (${currencyLabel})`, `Current Price (${currencyLabel})`, `Value (${currencyLabel})`, "P&L", "P&L %"];
  const rows = holdings.map((h) => {
    const livePrice = prices[h.coinId]?.price ?? 0;
    const value     = livePrice * h.quantity;
    const cost      = h.buyPrice * h.quantity;
    const pnl       = value - cost;
    const pnlPct    = cost > 0 ? ((pnl / cost) * 100).toFixed(2) : 0;
    return [h.coinName, h.coinSymbol, h.quantity, h.buyPrice.toFixed(6), livePrice.toFixed(6), value.toFixed(2), pnl.toFixed(2), pnlPct];
  });
  const csv  = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `portfolio_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Portfolio() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const toast      = useToast();
  const { user }     = useSelector((s) => s.auth);
  const { holdings, loading } = useSelector((s) => s.portfolio);
  const currency     = useSelector((s) => s.currency.current);
  const [prices,     setPrices]     = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [showModal,  setShowModal]  = useState(false);

  useEffect(() => { if (user) dispatch(fetchPortfolio()); }, [user, dispatch]);

  useEffect(() => {
    const ids = [...new Set(holdings.map((h) => h.coinId))];
    if (!ids.length) return;
    setPriceLoading(true);
    coingeckoAPI.getCoinsByIds(ids, currency.code)
      .then((coins) => {
        const map = {};
        coins.forEach((c) => { map[c.id] = c; });
        setPrices(map);
      })
      .catch(() => {})
      .finally(() => setPriceLoading(false));
  }, [holdings, currency.code]);

  const stats = useMemo(() => {
    let totalValue = 0, totalCost = 0;
    holdings.forEach((h) => {
      const livePrice  = prices[h.coinId]?.price ?? 0;
      totalValue += livePrice * h.quantity;
      totalCost  += h.buyPrice * h.quantity;
    });
    const pnl    = totalValue - totalCost;
    const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    return { totalValue, totalCost, pnl, pnlPct };
  }, [holdings, prices]);

  const handleAdd = async (body) => {
    const res = await dispatch(addHolding(body));
    if (addHolding.fulfilled.match(res)) toast("Holding added", "success");
    else toast(res.payload || "Failed to add", "error");
  };

  const handleRemove = async (holdingId, name) => {
    if (!window.confirm(`Remove ${name} from portfolio?`)) return;
    const res = await dispatch(removeHolding(holdingId));
    if (removeHolding.fulfilled.match(res)) toast("Holding removed", "info");
    else toast("Failed to remove", "error");
  };

  if (!user) return (
    <div style={{ maxWidth: 480, margin: "120px auto", textAlign: "center", padding: 20 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <BriefcaseIcon size={36} color="var(--accent)" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Login Required</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>Sign in to track your crypto portfolio and P&L.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Button onClick={() => navigate("/login")}>Login</Button>
        <Button variant="ghost" onClick={() => navigate("/signup")}>Sign Up</Button>
      </div>
    </div>
  );

  const isProfit = stats.pnl >= 0;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      {showModal && <AddHoldingModal onClose={() => setShowModal(false)} onAdd={handleAdd} currency={currency} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BriefcaseIcon size={22} color="var(--accent)" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Portfolio</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{holdings.length} holding{holdings.length !== 1 ? "s" : ""} tracked</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {holdings.length > 0 && (
            <button
              onClick={() => exportPortfolioCSV(holdings, prices, currency.label)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 9, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <DownloadIcon size={14} color="currentColor" />
              Export CSV
            </button>
          )}
          <Button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <PlusIcon size={14} color="currentColor" />
            Add Holding
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      {holdings.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
            {[
              { label: "Total Value",    value: formatPrice(stats.totalValue, currency.symbol), color: "var(--text-primary)", Icon: BarChart2Icon },
              { label: "Total Invested", value: formatPrice(stats.totalCost, currency.symbol),  color: "var(--text-secondary)", Icon: BriefcaseIcon },
              { label: "Total P&L",      value: `${isProfit ? "+" : ""}${formatPrice(stats.pnl, currency.symbol)}`, color: isProfit ? "var(--green)" : "var(--red)", Icon: isProfit ? TrendUpIcon : TrendDownIcon },
              { label: "Return",         value: `${isProfit ? "+" : ""}${stats.pnlPct.toFixed(2)}%`,              color: isProfit ? "var(--green)" : "var(--red)", Icon: isProfit ? TrendUpIcon : TrendDownIcon },
            ].map(({ label, value, color, Icon }) => (
              <div key={label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                  <Icon size={14} color={color} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color }}>{priceLoading ? "..." : value}</div>
                {label === "Return" && !priceLoading && (
                  <PnLBar pnlPct={stats.pnlPct} isProfit={isProfit} />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Holdings table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : holdings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <BarChart2Icon size={32} color="var(--accent)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No holdings yet</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 28, maxWidth: 320, margin: "0 auto 28px" }}>
            Add your first holding to start tracking your portfolio performance.
          </p>
          <Button onClick={() => setShowModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <PlusIcon size={14} color="currentColor" />
            Add Your First Holding
          </Button>
        </div>
      ) : (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 48px", gap: 12, padding: "11px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.025)" }}>
            {["Coin", "Holdings", "Avg Buy", "Current", "24h", "Value", "P&L", ""].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</span>
            ))}
          </div>
          {holdings.map((h) => {
            const live      = prices[h.coinId];
            const livePrice = live?.price ?? 0;
            const change24h = live?.change ?? null;
            const value     = livePrice * h.quantity;
            const cost      = h.buyPrice * h.quantity;
            const pnl       = value - cost;
            const pnlPct    = cost > 0 ? (pnl / cost) * 100 : 0;
            const isPos     = pnl >= 0;
            return (
              <div key={h._id}
                style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 48px", gap: 12, padding: "14px 20px", alignItems: "center", borderBottom: "1px solid var(--border)", transition: "background 0.12s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate(`/coin/${h.coinId}`)}>
                  {h.coinImage && <img src={h.coinImage} alt={h.coinName} style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} onError={(e) => e.target.style.display = "none"} />}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{h.coinName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{h.coinSymbol}</div>
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{h.quantity} {h.coinSymbol}</span>
                <span style={{ fontSize: 13 }}>{formatPrice(h.buyPrice, currency.symbol)}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{priceLoading ? "..." : formatPrice(livePrice, currency.symbol)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: priceLoading ? "var(--text-muted)" : (change24h ?? 0) >= 0 ? "var(--green)" : "var(--red)" }}>
                  {priceLoading ? "..." : change24h != null ? formatChange(change24h) : "—"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{priceLoading ? "..." : formatPrice(value, currency.symbol)}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isPos ? "var(--green)" : "var(--red)" }}>
                    {isPos ? "+" : ""}{formatPrice(pnl, currency.symbol)}
                  </div>
                  <div style={{ fontSize: 11, color: isPos ? "var(--green)" : "var(--red)" }}>
                    {isPos ? "+" : ""}{pnlPct.toFixed(2)}%
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(h._id, h.coinName)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 6, transition: "color 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--red)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  <TrashIcon size={15} color="currentColor" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
