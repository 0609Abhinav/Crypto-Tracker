import React, { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);

export const useToast = () => useContext(ToastCtx);

let id = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "info") => {
    const tid = ++id;
    setToasts((prev) => [...prev, { id: tid, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== tid)), 3500);
  }, []);

  const colors = { success: "var(--green)", error: "var(--red)", info: "var(--accent)", warning: "var(--yellow)" };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map((t) => (
          <div key={t.id} className="fade-in" style={{
            background: "var(--bg-card)", border: `1px solid ${colors[t.type]}`,
            borderLeft: `4px solid ${colors[t.type]}`,
            borderRadius: 10, padding: "12px 18px",
            color: "var(--text-primary)", fontSize: 14, fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)", minWidth: 260, maxWidth: 360,
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
