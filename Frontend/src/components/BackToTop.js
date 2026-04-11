import React, { useState, useEffect } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Back to top"
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 200,
        width: 44, height: 44, borderRadius: "50%",
        background: "var(--accent)", border: "none",
        color: "#fff", fontSize: 18, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
        transition: "opacity 0.2s, transform 0.2s",
        animation: "fadeIn 0.3s ease",
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      ↑
    </button>
  );
}
