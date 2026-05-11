// client/components/ui/StatCard.tsx
"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  change: number; // percent, positive = up, negative = down
  previousLabel: string;
  onDetails?: () => void;
}

export function StatCard({ title, value, change, previousLabel, onDetails }: StatCardProps) {
  const isUp = change >= 0;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "24px 28px 20px",
        flex: 1,
        minWidth: 220,
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: "#222" }}>{title}</span>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>⋮</button>
      </div>

      {/* Value + Change */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: "#111", letterSpacing: "-1px" }}>{value}</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isUp ? "#22c55e" : "#ef4444",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {isUp ? "↑" : "↓"} {Math.abs(change)}%
        </span>
      </div>

      {/* Previous Month */}
      <span style={{ fontSize: 12, color: "#888" }}>
        Previous Month{" "}
        <span style={{ color: isUp ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
          {previousLabel}
        </span>
      </span>

      {/* Details Button */}
      {onDetails && (
        <button
          onClick={onDetails}
          style={{
            marginTop: 14,
            alignSelf: "flex-start",
            padding: "5px 18px",
            borderRadius: 20,
            border: "1.5px solid #f5c518",
            background: "transparent",
            color: "#b8960a",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fef9e7")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Details
        </button>
      )}
    </div>
  );
}