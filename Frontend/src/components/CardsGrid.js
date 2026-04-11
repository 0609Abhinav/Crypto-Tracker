import React from "react";
import Card from "./Card";
import { CardsGridSkeleton } from "./ui/Skeletons";

const CardsGrid = ({ coins, loading, skeletonCount = 8, emptyMessage }) => {
  if (loading) return <CardsGridSkeleton count={skeletonCount} />;

  if (!coins.length && emptyMessage) return (
    <div style={{
      textAlign: "center", padding: "48px 20px",
      color: "var(--text-muted)", fontSize: 14,
    }}>
      {emptyMessage}
    </div>
  );

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      gap: 20,
    }}>
      {coins.map((coin) => (
        <Card key={coin.id} coin={coin} />
      ))}
    </div>
  );
};

export default CardsGrid;
