"use client";

import React from "react";
import { TopShop } from "@/lib/api/dashboard";

interface ProvinceListProps {
  shops: TopShop[];
  onViewInsight?: () => void;
}

function formatK(val: string | number): string {
  const n = Number(val);
  if (isNaN(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export function ProvinceList({ shops, onViewInsight }: ProvinceListProps) {
  const maxRevenue = Math.max(...shops.map((s) => Number(s.total_revenue)), 1);

  // mock % change per shop (positive/negative alternating for demo)
  const mockChanges = [25.8, -15.8, 35.8, 12.4, -8.2];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "20px 20px 16px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>
          Top Shops by Sales
        </span>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#888" }}>
          Sales
        </span>
      </div>

      {/* List */}
      {shops.length === 0 ? (
        <div style={{ textAlign: "center", color: "#aaa", padding: "24px 0", fontSize: 13 }}>
          No data yet
        </div>
      ) : (
        shops.map((shop, idx) => {
          const pct = (Number(shop.total_revenue) / maxRevenue) * 100;
          const change = mockChanges[idx] ?? 10;
          const isUp = change >= 0;

          return (
            <div
              key={shop.shop_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: idx < shops.length - 1 ? "1px solid #f5f5f5" : "none",
              }}
            >
              {/* Shop name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#111",
                    marginBottom: 5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {formatK(shop.total_revenue)}k
                </div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 5 }}>
                  {shop.shop_name}
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    height: 4,
                    background: "#f0f0f0",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "#4a6cf7",
                      borderRadius: 4,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {/* % change */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isUp ? "#22c55e" : "#ef4444",
                  whiteSpace: "nowrap",
                  minWidth: 54,
                  textAlign: "right",
                }}
              >
                {isUp ? "↑" : "↓"} {Math.abs(change)}%
              </div>
            </div>
          );
        })
      )}

      {/* View Insight button */}
      <button
        onClick={onViewInsight}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "10px 0",
          borderRadius: 24,
          border: "1.5px solid #f5c518",
          background: "transparent",
          color: "#b8960a",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#fef9e7")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        View Insight
      </button>
    </div>
  );
}