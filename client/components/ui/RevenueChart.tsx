// client/components/ui/RevenueChart.tsx
"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

type ChartMode = "line" | "bar";
type TimeRange = "lastWeek" | "lastMonth" | "lastQuarter" | "lastYear";

interface RevenueChartProps {
  title?: string;
  metric: "revenue" | "platform_fee" | "net_amount";
  metricLabel: string;
  metricValue: string;
  data: { label: string; value: number }[];
  onRangeChange?: (range: TimeRange) => void;
  activeRange?: TimeRange;
}

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "lastWeek", label: "Last week" },
  { key: "lastMonth", label: "Last Month" },
  { key: "lastQuarter", label: "Last Quarter" },
  { key: "lastYear", label: "Last Year" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#1a1a1a",
          color: "#fff",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ color: "#aaa", fontSize: 11, marginBottom: 2 }}>{label}</div>
        <div>{Number(payload[0].value).toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

export function RevenueChart({
  metric,
  metricLabel,
  metricValue,
  data,
  onRangeChange,
  activeRange = "lastWeek",
}: RevenueChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>("line");

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "24px 28px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        marginTop: 24,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0 }}>
          {chartMode === "line" ? "Line Graph" : "Bar Graph"}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Time range pills */}
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "#f5f5f5",
              borderRadius: 20,
              padding: "3px 4px",
            }}
          >
            {TIME_RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => onRangeChange?.(r.key)}
                style={{
                  padding: "4px 14px",
                  borderRadius: 16,
                  border: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: activeRange === r.key ? "#f5c518" : "transparent",
                  color: activeRange === r.key ? "#111" : "#888",
                  transition: "all 0.15s",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Chart mode toggle */}
          <button
            onClick={() => setChartMode(chartMode === "line" ? "bar" : "line")}
            title={chartMode === "line" ? "Switch to Bar" : "Switch to Line"}
            style={{
              background: "#f5f5f5",
              border: "none",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 16,
              color: "#555",
            }}
          >
            {chartMode === "line" ? "▪️📊" : "📈"}
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>⋮</button>
        </div>
      </div>

      {/* Metric label */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#111" }}>{metricValue}</div>
        <div style={{ fontSize: 12, color: "#888" }}>{metricLabel}</div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === "line" ? (
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f5c518" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f5c518" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#aaa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#aaa" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f5c518"
                strokeWidth={3}
                fill="url(#goldGrad)"
                dot={false}
                activeDot={{ r: 6, fill: "#f5c518", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#aaa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#aaa" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#f5c518" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <rect
                    key={index}
                    fill={index === data.reduce((mi, d, i, arr) => d.value > arr[mi].value ? i : mi, 0) ? "#f5c518" : "#e8e8e8"}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}