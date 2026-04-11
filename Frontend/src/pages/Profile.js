import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useToast } from "../components/ui/Toast";
import { logout, updateUser } from "../store/authSlice";
import { clearWatchlist } from "../store/watchlistSlice";

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const { coinIds } = useSelector((s) => s.watchlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [nameForm, setNameForm] = useState({ name: user?.name || "" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) return;
    setNameLoading(true);
    try {
      const res = await authAPI.updateProfile({ name: nameForm.name });
      localStorage.setItem("token", res.token);
      // Directly update the user in Redux store
      dispatch(updateUser(res.user));
      toast("Name updated successfully", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setNameLoading(false);
    }
  };

  const handlePassUpdate = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast("Passwords don't match", "error"); return;
    }
    if (passForm.newPassword.length < 6) {
      toast("Password must be at least 6 characters", "error"); return;
    }
    setPassLoading(true);
    try {
      await authAPI.updateProfile({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast("Password updated successfully", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearWatchlist());
    toast("Logged out", "info");
    navigate("/");
  };

  const Section = ({ title, children }) => (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 16, padding: "24px 28px", marginBottom: 20,
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
        {title}
      </h2>
      {children}
    </div>
  );

  const Field = ({ label, type = "text", value, onChange, placeholder }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px",
          background: "var(--bg-primary)", border: "1px solid var(--border)",
          borderRadius: 10, color: "var(--text-primary)", fontSize: 14,
          outline: "none", fontFamily: "inherit", boxSizing: "border-box",
        }}
        onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
        onBlur={(e) => e.target.style.borderColor = "var(--border)"}
      />
    </div>
  );

  const Btn = ({ loading, children, variant = "primary", ...props }) => (
    <button
      {...props}
      disabled={loading}
      style={{
        padding: "10px 20px", borderRadius: 10,
        background: variant === "danger" ? "var(--red-bg)" : "var(--accent)",
        color: variant === "danger" ? "var(--red)" : "#fff",
        border: variant === "danger" ? "1px solid var(--red)" : "none",
        fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "inherit", opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "Saving..." : children}
    </button>
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32 }}>Account Settings</h1>

      {/* Overview */}
      <Section title="Profile Overview">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), #818cf8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{user.email}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {coinIds.length} coin{coinIds.length !== 1 ? "s" : ""} in watchlist
            </div>
          </div>
        </div>
      </Section>

      {/* Update name */}
      <Section title="Update Name">
        <form onSubmit={handleNameUpdate}>
          <Field
            label="Full Name"
            value={nameForm.name}
            onChange={(e) => setNameForm({ name: e.target.value })}
            placeholder="Your name"
          />
          <Btn loading={nameLoading} type="submit">Save Name</Btn>
        </form>
      </Section>

      {/* Change password */}
      <Section title="Change Password">
        <form onSubmit={handlePassUpdate}>
          <Field label="Current Password" type="password" value={passForm.currentPassword}
            onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
            placeholder="••••••••" />
          <Field label="New Password" type="password" value={passForm.newPassword}
            onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
            placeholder="Min. 6 characters" />
          <Field label="Confirm New Password" type="password" value={passForm.confirmPassword}
            onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
            placeholder="Repeat new password" />
          <Btn loading={passLoading} type="submit">Update Password</Btn>
        </form>
      </Section>

      {/* Danger zone */}
      <Section title="Session">
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
          Sign out of your account on this device.
        </p>
        <Btn variant="danger" onClick={handleLogout}>Sign Out</Btn>
      </Section>
    </div>
  );
}
