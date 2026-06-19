import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { alertsAPI } from "../services/api";
import { coingeckoAPI } from "../services/coingecko";
import { formatPrice } from "../utils/format";
import { useToast } from "../components/ui/Toast";
import Button from "../components/ui/Button";
import { BellIcon, BellOffIcon, TrashIcon, PlusIcon, XIcon, ArrowUpIcon, ArrowDownIcon, CheckIcon } from "../components/Icons";

function CreateAlertModal({ onClose, onCreate, currency }) {
  const [search,      setSearch]      = useState("");
  const [results,     setResults]     = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition,   setCondition]   = useState("above");
  const [loading,     setLoading]     = useState(false);

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    try {
      const coins = await coingeckoAPI.searchCoins(q);
      setResults(coins);
    } catch { setResults([]); }
  };

  const selectCoin = async (coin) => {
    setSearch(coin.name);
    setResults([]);
    try {
      const [data] = await coingeckoAPI.getCoinsByIds([coin.id], currency.code);
      setSelected({ ...coin, currentPrice: data?.price });
      setTargetPrice(data?.price?.toString() || "");
    } catch {
      setSelected(coin);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected || !targetPrice) return;
    setLoading(true);
    await onCreate({ coinId: selected.id, coinName: selected.name, coinSymbol: selected.symbol?.toUpperCase(), targetPrice: parseFloat(targetPrice), condition });
    setLoading(false);
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", background: "var(--bg-primary)",
    border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)",
    fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BellIcon size={18} color="var(--accent)" />
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>Create Price Alert</h2>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-muted)", cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <XIcon size={14} color="currentColor" />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Coin *</label>
            <input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Search coin..." style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
            {results.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, zIndex: 10, maxHeight: 180, overflowY: "auto", marginTop: 4 }}>
                {results.map((c) => (
                  <div key={c.id} onClick={() => selectCoin(c)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer" }}
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

          {selected?.currentPrice && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "8px 12px", background: "rgba(99,102,241,0.08)", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Current: <strong style={{ color: "var(--accent)" }}>{formatPrice(selected.currentPrice, currency.symbol)}</strong>
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Alert when price is</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { key: "above", label: "Above", Icon: ArrowUpIcon, color: "var(--green)" },
                { key: "below", label: "Below", Icon: ArrowDownIcon, color: "var(--red)" },
              ].map(({ key, label, Icon, color }) => (
                <button key={key} type="button" onClick={() => setCondition(key)} style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, border: "1px solid",
                  borderColor: condition === key ? (key === "above" ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)") : "var(--border)",
                  background: condition === key ? (key === "above" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)") : "transparent",
                  color: condition === key ? color : "var(--text-secondary)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                  <Icon size={13} color="currentColor" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Target Price ({currency.symbol}) *
            </label>
            <input type="number" step="any" min="0" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="0.00" style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"} required />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Button type="submit" loading={loading} style={{ flex: 1 }}>Create Alert</Button>
            <Button variant="ghost" type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Alerts() {
  const { user }   = useSelector((s) => s.auth);
  const currency   = useSelector((s) => s.currency.current);
  const navigate   = useNavigate();
  const toast      = useToast();
  const [alerts,     setAlerts]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAlerts((await alertsAPI.get()).alerts); }
    catch { toast("Failed to load alerts", "error"); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { if (user) load(); }, [user, load]);

  const handleCreate = async (body) => {
    try {
      const res = await alertsAPI.create(body);
      setAlerts((a) => [res.alert, ...a]);
      toast("Alert created", "success");
    } catch (err) { toast(err.message, "error"); }
  };

  const handleDelete = async (id) => {
    try {
      await alertsAPI.delete(id);
      setAlerts((a) => a.filter((x) => x._id !== id));
      toast("Alert deleted", "info");
    } catch { toast("Failed to delete", "error"); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await alertsAPI.toggle(id);
      setAlerts((a) => a.map((x) => x._id === id ? res.alert : x));
    } catch { toast("Failed to toggle", "error"); }
  };

  if (!user) return (
    <div style={{ maxWidth: 480, margin: "120px auto", textAlign: "center", padding: 20 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <BellIcon size={36} color="var(--accent)" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Login Required</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>Sign in to set price alerts for your favourite coins.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Button onClick={() => navigate("/login")}>Login</Button>
        <Button variant="ghost" onClick={() => navigate("/signup")}>Sign Up</Button>
      </div>
    </div>
  );

  const activeCount   = alerts.filter((a) => a.active && !a.triggered).length;
  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      {showModal && <CreateAlertModal onClose={() => setShowModal(false)} onCreate={handleCreate} currency={currency} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BellIcon size={22} color="var(--accent)" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Price Alerts</h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{alerts.length} total</span>
            {activeCount > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", background: "var(--green-bg)", padding: "1px 8px", borderRadius: 20 }}>{activeCount} active</span>}
            {triggeredCount > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", background: "rgba(99,102,241,0.1)", padding: "1px 8px", borderRadius: 20 }}>{triggeredCount} triggered</span>}
          </div>
        </div>
        <Button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PlusIcon size={14} color="currentColor" />
          New Alert
        </Button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <BellOffIcon size={30} color="var(--accent)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No alerts yet</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>Get notified when a coin hits your target price.</p>
          <Button onClick={() => setShowModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <PlusIcon size={14} color="currentColor" />
            Create Your First Alert
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {alerts.map((a) => (
            <div key={a._id} style={{
              background: "var(--bg-card)",
              border: `1px solid ${a.triggered ? "rgba(99,102,241,0.3)" : a.active ? "var(--border)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: 14, padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
              opacity: a.active || a.triggered ? 1 : 0.5,
              transition: "all 0.2s",
            }}>
              {/* Coin icon placeholder */}
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${a.condition === "above" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"}`, border: `1px solid ${a.condition === "above" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {a.condition === "above"
                  ? <ArrowUpIcon size={18} color="var(--green)" />
                  : <ArrowDownIcon size={18} color="var(--red)" />
                }
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{a.coinName}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 6 }}>{a.coinSymbol}</span>
                  {a.triggered && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", background: "var(--green-bg)", padding: "2px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckIcon size={10} color="var(--green)" />
                      Triggered
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Alert when price is{" "}
                  <span style={{ color: a.condition === "above" ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                    {a.condition === "above" ? "above" : "below"}
                  </span>
                  {" "}<strong style={{ color: "var(--text-primary)" }}>{formatPrice(a.targetPrice, currency.symbol)}</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => handleToggle(a._id)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)",
                    background: a.active ? "rgba(16,185,129,0.08)" : "transparent",
                    color: a.active ? "var(--green)" : "var(--text-muted)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s",
                  }}
                >
                  {a.active
                    ? <><CheckIcon size={11} color="currentColor" /> Active</>
                    : <><BellOffIcon size={11} color="currentColor" /> Paused</>
                  }
                </button>
                <button
                  onClick={() => handleDelete(a._id)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 6, transition: "color 0.2s", display: "flex", alignItems: "center" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--red)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
                  <TrashIcon size={15} color="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
