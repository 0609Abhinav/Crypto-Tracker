import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: "60vh", display: "flex", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: 20,
      }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💥</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: "var(--text-primary)" }}>
            Something crashed
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, maxWidth: 360 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: "var(--accent)", color: "#fff", fontSize: 14,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
