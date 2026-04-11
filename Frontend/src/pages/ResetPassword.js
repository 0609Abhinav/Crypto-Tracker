import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authExtAPI } from "../services/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await authExtAPI.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, var(--accent), #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 16px" }}>🔒</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Reset Password</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Enter your new password below</p>
      </div>

      {done ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Password reset!</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>Redirecting you to login...</p>
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Go to Login →</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "var(--red-bg)", border: "1px solid var(--red)", color: "var(--red)", fontSize: 14 }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>New Password</label>
            <div style={{ position: "relative" }}>
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required style={{ width: "100%", padding: "12px 44px 12px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
              <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>{show ? "🙈" : "👁"}</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Confirm Password</label>
            <input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat new password" required style={{ width: "100%", padding: "12px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: "13px", borderRadius: 12, border: "none", background: "var(--accent)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
            <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>← Back to Login</Link>
          </div>
        </form>
      )}
    </div>
  );
}
