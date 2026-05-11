// client/components/ui/MiniBarChart.tsx
"use client";

import React from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

interface MiniBarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#1a1a1a",
          color: "#fff",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {label}: {payload[0].value}
      </div>
    );
  }
  return null;
};

export function MiniBarChart({
  data,
  color = "#f5c518",
  height = 60,
}: MiniBarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ width: "100%", height, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.value === maxVal ? color : `${color}66`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}