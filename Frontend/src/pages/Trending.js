import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrending } from "../store/marketSlice";
import CardsGrid from "../components/CardsGrid";

export default function Trending() {
  const dispatch = useDispatch();
  const { trending, trendingLoading } = useSelector((s) => s.market);

  useEffect(() => { if (!trending.length) dispatch(fetchTrending()); }, [dispatch, trending.length]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>🔥 Trending Coins</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Most searched coins in the last 24 hours</p>
      </div>
      <CardsGrid coins={trending} loading={trendingLoading} skeletonCount={15} />
    </div>
  );
}
