import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
      <div>
        <div style={{ fontSize: 80, fontWeight: 900, color: "var(--accent)", lineHeight: 1, marginBottom: 16 }}>404</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Page not found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>The page you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    </div>
  );
}
