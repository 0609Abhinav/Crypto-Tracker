import React from "react";

const Input = ({ label, error, icon, style, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
    {label && <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</label>}
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        style={{
          width: "100%", padding: icon ? "11px 14px 11px 38px" : "11px 14px",
          background: "var(--bg-secondary)", border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
          borderRadius: 10, color: "var(--text-primary)", fontSize: 14,
          outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
          ...style,
        }}
        onFocus={(e) => { e.target.style.borderColor = error ? "var(--red)" : "var(--accent)"; }}
        onBlur={(e) => { e.target.style.borderColor = error ? "var(--red)" : "var(--border)"; }}
      />
    </div>
    {error && <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>}
  </div>
);

export default Input;
