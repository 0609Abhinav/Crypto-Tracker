import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { signupUser, clearError } from "../store/authSlice";
import { useToast } from "../components/ui/Toast";

const validate = (f) => {
  const e = {};
  if (!f.name.trim()) e.name = "Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Invalid email address";
  if (f.password.length < 6) e.password = "Minimum 6 characters";
  return e;
};

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const res = await dispatch(signupUser(form));
    if (signupUser.fulfilled.match(res)) {
      toast(`Account created! Welcome, ${res.payload.name?.split(" ")[0]} 🎉`, "success");
      navigate("/");
    } else {
      toast(res.payload || "Signup failed", "error");
    }
  };

  const Field = ({ label, name, type = "text", placeholder, extra }) => (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={name === "password" ? (showPass ? "text" : "password") : type}
          value={form[name]}
          onChange={set(name)}
          placeholder={placeholder}
          required
          style={{
            width: "100%", padding: name === "password" ? "12px 44px 12px 14px" : "12px 14px",
            background: "var(--bg-primary)",
            border: `1px solid ${errors[name] ? "var(--red)" : "var(--border)"}`,
            borderRadius: 10, color: "var(--text-primary)", fontSize: 14,
            outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => e.target.style.borderColor = errors[name] ? "var(--red)" : "var(--accent)"}
          onBlur={(e) => e.target.style.borderColor = errors[name] ? "var(--red)" : "var(--border)"}
        />
        {name === "password" && (
          <button type="button" onClick={() => setShowPass(!showPass)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", color: "var(--text-muted)",
            cursor: "pointer", fontSize: 16, padding: 0,
          }}>
            {showPass ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {errors[name] && <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4 }}>{errors[name]}</p>}
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 24, padding: "44px 40px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 16px",
          }}>🚀</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Start tracking crypto for free
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="Full name" name="name" placeholder="Abhinav Tripathi" />
          <Field label="Email address" name="email" type="email" placeholder="you@example.com" />
          <Field label="Password" name="password" placeholder="Min. 6 characters" />

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "var(--red-bg)", border: "1px solid var(--red)",
              color: "var(--red)", fontSize: 13,
            }}>
              ⚠️ {error}
            </div>
          )}

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
              <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Creating account...</>
            ) : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
