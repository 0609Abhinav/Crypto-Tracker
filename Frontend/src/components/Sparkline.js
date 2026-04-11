import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const Sparkline = ({ data, isPositive, width = 80, height = 36 }) => {
  if (!data || data.length < 2) return null;
  const color = isPositive ? "#10b981" : "#ef4444";
  const chartData = data.map((v) => ({ v }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone" dataKey="v"
          stroke={color} strokeWidth={1.5}
          dot={false} isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;
