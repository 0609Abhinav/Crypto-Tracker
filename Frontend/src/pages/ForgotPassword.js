import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authExtAPI } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authExtAPI.forgotPassword(email);
      setSent(true);
      if (res.devToken) setDevToken(res.devToken); // dev mode only
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, var(--accent), #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 16px" }}>🔑</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Forgot Password</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Enter your email and we'll send a reset link</p>
      </div>

      {sent ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Check your email</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            If an account exists for <strong>{email}</strong>, a password reset link has been sent.
          </p>
          {devToken && (
            <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>DEV MODE — Reset Token:</div>
              <Link to={`/reset-password/${devToken}`} style={{ fontSize: 12, color: "var(--accent)", wordBreak: "break-all" }}>
                /reset-password/{devToken}
              </Link>
            </div>
          )}
          <Link to="/login" style={{ color: "var(--accent)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>← Back to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "var(--red-bg)", border: "1px solid var(--red)", color: "var(--red)", fontSize: 14 }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: "100%", padding: "12px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: "13px", borderRadius: 12, border: "none", background: "var(--accent)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
            Remember your password? <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Login</Link>
          </div>
        </form>
      )}
    </div>
  );
}
