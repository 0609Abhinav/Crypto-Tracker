import React from "react";

const variants = {
  primary: {
    background: "var(--accent)", color: "#fff", border: "none",
  },
  ghost: {
    background: "transparent", color: "var(--text-secondary)",
    border: "1px solid var(--border)",
  },
  danger: {
    background: "var(--red-bg)", color: "var(--red)",
    border: "1px solid var(--red)",
  },
  success: {
    background: "var(--green-bg)", color: "var(--green)",
    border: "1px solid var(--green)",
  },
};

const Button = ({ children, variant = "primary", size = "md", loading, style, ...props }) => {
  const pad = size === "sm" ? "6px 14px" : size === "lg" ? "14px 28px" : "10px 20px";
  const fs = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        ...variants[variant],
        padding: pad, fontSize: fs, fontWeight: 600,
        borderRadius: 10, cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 8,
        transition: "all 0.2s ease",
        opacity: (loading || props.disabled) ? 0.6 : 1,
        fontFamily: "inherit",
        ...style,
      }}
      onMouseEnter={(e) => { if (!loading && !props.disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      {loading ? <span style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> : null}
      {children}
    </button>
  );
};

export default Button;
