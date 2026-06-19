import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { clearWatchlist } from "../store/watchlistSlice";
import { clearPortfolio } from "../store/portfolioSlice";
import { clearPrefs, savePrefs } from "../store/prefsSlice";
import { toggleTheme } from "../store/themeSlice";
import { useToast } from "./ui/Toast";
import Button from "./ui/Button";
import GlobalSearch from "./GlobalSearch";
import CurrencySwitcher from "./CurrencySwitcher";
import {
  HomeIcon, MarketIcon, FlameIcon, TrendUpIcon, HeatmapIcon, NewsIcon,
  StarIcon, BriefcaseIcon, BellIcon, ArrowsIcon, ScaleIcon, GasIcon,
  SunIcon, MoonIcon, LogoutIcon, UserIcon, ChevronDownIcon,
} from "./Icons";

function MoreMenu({ links, isActive }) {
  const [open, setOpen] = useState(false);
  const anyActive = links.some((l) => isActive(l.to));
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button style={{
        padding: "5px 10px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500,
        cursor: "pointer", fontFamily: "inherit",
        color: anyActive ? "var(--accent)" : "var(--text-secondary)",
        background: anyActive ? "rgba(99,102,241,0.1)" : "transparent",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        More <ChevronDownIcon size={12} color={anyActive ? "var(--accent)" : "var(--text-secondary)"} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, zIndex: 200, minWidth: 190,
          boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
          overflow: "hidden", paddingTop: 6, paddingBottom: 6,
        }}>
          {links.map(({ to, label, Icon }) => (
            <Link key={to} to={to} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 16px",
              textDecoration: "none", fontSize: 13, fontWeight: 500,
              color: isActive(to) ? "var(--accent)" : "var(--text-secondary)",
              background: isActive(to) ? "rgba(99,102,241,0.08)" : "transparent",
              transition: "background 0.1s",
            }}
              onMouseEnter={(e) => { if (!isActive(to)) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (!isActive(to)) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={15} color={isActive(to) ? "var(--accent)" : "var(--text-muted)"} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const { coinIds } = useSelector((s) => s.watchlist);
  const { mode } = useSelector((s) => s.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearWatchlist());
    dispatch(clearPortfolio());
    dispatch(clearPrefs());
    toast("Logged out successfully", "info");
    navigate("/");
    setOpen(false);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    // Save new theme to DB — mode will flip so we send the opposite
    if (user) dispatch(savePrefs({ theme: mode === "dark" ? "light" : "dark" }));
  };

  const isActive = (to) => to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const NAV_LINKS = [
    { to: "/",        label: "Home",     Icon: HomeIcon },
    { to: "/market",  label: "Market",   Icon: MarketIcon },
    { to: "/trending",label: "Trending", Icon: FlameIcon },
    { to: "/gainers", label: "Gainers",  Icon: TrendUpIcon },
    { to: "/heatmap", label: "Heatmap",  Icon: HeatmapIcon },
    { to: "/news",    label: "News",     Icon: NewsIcon },
    { to: "/watchlist", label: "Watchlist", Icon: StarIcon, badge: user && coinIds.length > 0 ? coinIds.length : null },
  ];

  const MORE_LINKS = [
    { to: "/portfolio", label: "Portfolio",   Icon: BriefcaseIcon },
    { to: "/alerts",    label: "Alerts",      Icon: BellIcon },
    { to: "/converter", label: "Converter",   Icon: ArrowsIcon },
    { to: "/compare",   label: "Compare",     Icon: ScaleIcon },
    { to: "/gas",       label: "Gas Tracker", Icon: GasIcon },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      backgroundColor: "var(--bg-secondary)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 20px",
        height: 64, display: "flex", alignItems: "center", gap: 12,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--accent), #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff" }}>₿</div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--text-primary)" }} className="hide-mobile">
            Coin<span style={{ color: "var(--accent)" }}>Pulse</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }} className="desktop-nav">
          {NAV_LINKS.map(({ to, label, Icon, badge }) => (
            <Link key={to} to={to} style={{
              padding: "5px 10px", borderRadius: 8, textDecoration: "none",
              fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 5,
              color: isActive(to) ? "var(--accent)" : "var(--text-secondary)",
              background: isActive(to) ? "rgba(99,102,241,0.1)" : "transparent",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}>
              <Icon size={14} color={isActive(to) ? "var(--accent)" : "var(--text-secondary)"} />
              {label}
              {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 10, background: "var(--accent)", color: "#fff" }}>{badge}</span>}
            </Link>
          ))}
          <MoreMenu links={MORE_LINKS} isActive={isActive} />
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 260 }} className="desktop-nav">
          <GlobalSearch />
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div className="desktop-nav"><CurrencySwitcher /></div>

          {/* Theme toggle */}
          <button
            onClick={handleThemeToggle}
            title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            {mode === "dark" ? <SunIcon size={15} color="var(--text-secondary)" /> : <MoonIcon size={15} color="var(--text-secondary)" />}
          </button>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => navigate("/profile")} title={user.name} style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #818cf8)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                {user.name?.charAt(0).toUpperCase()}
              </button>
              <button onClick={handleLogout} title="Logout" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LogoutIcon size={15} color="var(--text-secondary)" />
              </button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Login</Button>
              <Button size="sm" onClick={() => navigate("/signup")}>Sign Up</Button>
            </>
          )}

          <button onClick={() => setOpen(!open)} className="hamburger" style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: 20, display: "none", padding: 4 }}>
            {open
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ marginBottom: 12 }}><GlobalSearch /></div>
          {[...NAV_LINKS, ...MORE_LINKS].map(({ to, label, Icon, badge }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} style={{ padding: "10px 14px", borderRadius: 8, textDecoration: "none", fontSize: 15, fontWeight: 500, display: "flex", alignItems: "center", gap: 10, color: isActive(to) ? "var(--accent)" : "var(--text-primary)" }}>
              <Icon size={16} color={isActive(to) ? "var(--accent)" : "var(--text-muted)"} />
              {label}
              {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: "var(--accent)", color: "#fff" }}>{badge}</span>}
            </Link>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <CurrencySwitcher />
            <button onClick={handleThemeToggle} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", padding: "7px 12px", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", fontFamily: "inherit" }}>
              {mode === "dark" ? <><SunIcon size={14} color="var(--text-secondary)" /> Light</> : <><MoonIcon size={14} color="var(--text-secondary)" /> Dark</>}
            </button>
            {user ? (
              <>
                <button onClick={() => { navigate("/profile"); setOpen(false); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  <UserIcon size={14} color="var(--accent)" /> Profile
                </button>
                <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  <LogoutIcon size={14} color="var(--red)" /> Logout
                </button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => { navigate("/login"); setOpen(false); }}>Login</Button>
                <Button size="sm" onClick={() => { navigate("/signup"); setOpen(false); }}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1000px) { .desktop-nav { display: none !important; } .hamburger { display: block !important; } }
      `}</style>
    </nav>
  );
}
