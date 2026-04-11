import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, clearError } from "../store/authSlice";
import { fetchWatchlist } from "../store/watchlistSlice";
import { useToast } from "../components/ui/Toast";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(res)) {
      dispatch(fetchWatchlist());
      toast(`Welcome back, ${res.payload.name?.split(" ")[0]}! 👋`, "success");
      navigate("/");
    } else {
      toast(res.payload || "Login failed", "error");
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      {/* Card */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 24,
        padding: "44px 40px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, var(--accent), #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 16px",
          }}>₿</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Sign in to your CoinPulse account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              style={{
                width: "100%", padding: "12px 14px",
                background: "var(--bg-primary)", border: "1px solid var(--border)",
                borderRadius: 10, color: "var(--text-primary)", fontSize: 14,
                outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Forgot password?</Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"} required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 44px 12px 14px",
                  background: "var(--bg-primary)", border: "1px solid var(--border)",
                  borderRadius: 10, color: "var(--text-primary)", fontSize: 14,
                  outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "var(--text-muted)",
                cursor: "pointer", fontSize: 16, padding: 0,
              }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "var(--red-bg)", border: "1px solid var(--red)",
              color: "var(--red)", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "13px",
              background: loading ? "var(--border)" : "var(--accent)",
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", transition: "opacity 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {loading ? (
              <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Signing in...</>
            ) : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
