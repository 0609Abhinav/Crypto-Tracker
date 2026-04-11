import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import GlobalStatsBar from "../components/GlobalStatsBar";
import BackToTop from "../components/BackToTop";
import { useScrollToTop } from "../hooks/useScrollToTop";

export default function AppLayout() {
  useScrollToTop();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <GlobalStatsBar />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
