import React from "react";

export const CardSkeleton = () => (
  <div style={{
    background: "var(--bg-card)", border: "1px solid var(--border)",
    borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="skeleton" style={{ height: 14, width: "60%" }} />
        <div className="skeleton" style={{ height: 11, width: "35%" }} />
      </div>
      <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
    </div>
    <div className="skeleton" style={{ height: 28, width: "50%" }} />
    <div style={{ display: "flex", gap: 8 }}>
      <div className="skeleton" style={{ height: 11, width: "40%" }} />
      <div className="skeleton" style={{ height: 11, width: "40%" }} />
    </div>
  </div>
);

export const CardsGridSkeleton = ({ count = 8 }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 20,
  }}>
    {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
  </div>
);

export const ChartSkeleton = () => (
  <div style={{
    background: "var(--bg-card)", border: "1px solid var(--border)",
    borderRadius: 16, padding: 24,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
      <div className="skeleton" style={{ height: 16, width: 120 }} />
      <div style={{ display: "flex", gap: 8 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 30, width: 48, borderRadius: 8 }} />)}
      </div>
    </div>
    <div className="skeleton" style={{ height: 280, width: "100%", borderRadius: 12 }} />
  </div>
);

export const CoinDetailSkeleton = () => (
  <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div className="skeleton" style={{ width: 56, height: 56, borderRadius: "50%" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 24, width: 160 }} />
        <div className="skeleton" style={{ height: 14, width: 80 }} />
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
          <div className="skeleton" style={{ height: 11, width: "50%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 20, width: "70%" }} />
        </div>
      ))}
    </div>
    <ChartSkeleton />
  </div>
);

export const TableRowSkeleton = () => (
  <div style={{
    display: "grid", gridTemplateColumns: "40px 2fr 1fr 1fr 1fr 80px",
    gap: 16, padding: "14px 20px", alignItems: "center",
    borderBottom: "1px solid var(--border)",
  }}>
    <div className="skeleton" style={{ height: 14, width: 24 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%" }} />
      <div className="skeleton" style={{ height: 14, width: 100 }} />
    </div>
    <div className="skeleton" style={{ height: 14, width: 70 }} />
    <div className="skeleton" style={{ height: 14, width: 60 }} />
    <div className="skeleton" style={{ height: 14, width: 80 }} />
    <div className="skeleton" style={{ height: 28, width: 60, borderRadius: 8 }} />
  </div>
);
