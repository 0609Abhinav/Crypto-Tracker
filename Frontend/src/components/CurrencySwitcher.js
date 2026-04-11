import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useCurrency } from "../hooks/useCurrency";
import { savePrefs } from "../store/prefsSlice";
import { useDispatch } from "react-redux";

export default function CurrencySwitcher() {
  const { currency, setCurrency, currencies } = useCurrency();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSelect = (c) => {
    setCurrency(c);
    setOpen(false);
    // Persist to DB if logged in
    if (user) dispatch(savePrefs({ currency: c.code }));
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "5px 10px", borderRadius: 8,
          background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
          color: "var(--text-secondary)", fontSize: 12, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {currency.symbol} {currency.label} ▾
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 10, zIndex: 200, overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)", minWidth: 120,
        }}>
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => handleSelect(c)}
              style={{
                width: "100%", padding: "9px 14px",
                background: currency.code === c.code ? "rgba(99,102,241,0.1)" : "transparent",
                border: "none", color: currency.code === c.code ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", textAlign: "left",
                display: "flex", alignItems: "center", gap: 8,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ width: 20 }}>{c.symbol}</span>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
