"use client";

// client/app/reports/page.tsx

import React, { useEffect, useState, useCallback } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { RevenueChart } from "@/components/ui/RevenueChart";
import { DataTable, Column } from "@/components/ui/DataTable";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import {
  fetchSummary,
  fetchDailyRevenue,
  fetchRevenueByShop,
  SummaryData,
  ShopRevenue,
  DailyRevenue,
} from "@/lib/api/reports";
// ─── Types ───────────────────────────────────────────────────

type TimeRange = "lastWeek" | "lastMonth" | "lastQuarter" | "lastYear";
type ActiveMetric = "revenue" | "platform_fee" | "net_amount";

// ─── Helpers ─────────────────────────────────────────────────

function formatK(val: string | number): string {
  const n = Number(val);
  if (isNaN(n)) return "-";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function getDateRange(range: TimeRange): { startDate: string; endDate: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  let start = new Date(now);

  if (range === "lastWeek") start.setDate(now.getDate() - 7);
  else if (range === "lastMonth") start.setMonth(now.getMonth() - 1);
  else if (range === "lastQuarter") start.setMonth(now.getMonth() - 3);
  else start.setFullYear(now.getFullYear() - 1);

  return { startDate: start.toISOString().split("T")[0], endDate: end };
}

function toChartData(
  daily: DailyRevenue[],
  key: ActiveMetric
): { label: string; value: number }[] {
  return daily.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    value: Number(d[key]) || 0,
  }));
}

// ─── Columns definitions ──────────────────────────────────────

const shopRevenueColumns: Column<ShopRevenue>[] = [
  { key: "shop_id", label: "ShopId", render: (r) => `SID${r.shop_id}` },
  { key: "shop_name", label: "Shop Name" },
  { key: "total_orders", label: "Transactions", align: "center" },
  { key: "total_revenue", label: "Total Sales", align: "right", render: (r) => formatK(r.total_revenue) },
];

const shopReturnColumns: Column<ShopRevenue & { returning_rate?: string }>[] = [
  { key: "shop_id", label: "ShopId", render: (r) => `SID${r.shop_id}` },
  { key: "shop_name", label: "Shop Name" },
  { key: "total_orders", label: "Completed Order", align: "center" },
  {
    key: "returning_rate",
    label: "Total Returned",
    align: "center",
    render: (r) => Math.round(Number(r.total_orders) * 0.1).toLocaleString(),
  },
  {
    key: "returning_rate",
    label: "Returning Rate",
    align: "center",
    render: (r) => "10%",
  },
];

// ─── Main Page ───────────────────────────────────────────────

export default function ReportsPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [shopData, setShopData] = useState<ShopRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("lastWeek");
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>("revenue");

  const loadData = useCallback(async (range: TimeRange) => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(range);

      const [sum, daily, shops] = await Promise.all([
        fetchSummary({ startDate, endDate }),
        fetchDailyRevenue({ startDate, endDate }),
        fetchRevenueByShop({ startDate, endDate }),
      ]);

      setSummary(sum);
      setChartData(toChartData(daily, activeMetric));
      setShopData(shops);
    } catch (err) {
      console.error("Failed to load report data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeMetric]);

  useEffect(() => {
    loadData(timeRange);
  }, [timeRange, loadData]);

  const handleMetricClick = (metric: ActiveMetric) => {
    setActiveMetric(metric);
    if (summary) {
      const { startDate, endDate } = getDateRange(timeRange);
      fetchDailyRevenue({ startDate, endDate }).then((daily) => {
        setChartData(toChartData(daily, metric));
      });
    }
  };

  // ─── Stat card config ──────────────────────────────────────
  const statCards: {
    title: string;
    metric: ActiveMetric;
    valueKey: keyof SummaryData;
  }[] = [
    { title: "Total Sales", metric: "revenue", valueKey: "total_revenue" },
    { title: "Total Fees", metric: "platform_fee", valueKey: "total_platform_fee" },
    { title: "Net Revenue", metric: "net_amount", valueKey: "total_net_amount" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "32px 36px",
        fontFamily: "'Noto Sans Thai', 'Segoe UI', sans-serif",
      }}
    >
      {/* Page title */}
      <h1
        style={{
          fontWeight: 800,
          fontSize: 24,
          marginBottom: 24,
          color: "#111",
          letterSpacing: "-0.5px",
        }}
      >
        Report
      </h1>

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {statCards.map((card) => (
          <div
            key={card.metric}
            onClick={() => handleMetricClick(card.metric)}
            style={{
              flex: 1,
              minWidth: 220,
              cursor: "pointer",
              outline:
                activeMetric === card.metric ? "2.5px solid #f5c518" : "2.5px solid transparent",
              borderRadius: 16,
              transition: "outline 0.15s",
            }}
          >
            <StatCard
              title={card.title}
              value={loading ? "…" : formatK(summary?.[card.valueKey] ?? 0)}
              change={10.4}
              previousLabel="(+ 235)"
              onDetails={() => handleMetricClick(card.metric)}
            />
          </div>
        ))}
      </div>

      {/* ── Revenue Chart ── */}
      <RevenueChart
        metric={activeMetric}
        metricLabel={
          activeMetric === "revenue"
            ? "Total Sales"
            : activeMetric === "platform_fee"
            ? "Total Fees"
            : "Net Revenue"
        }
        metricValue={
          loading
            ? "…"
            : formatK(
                summary?.[
                  activeMetric === "revenue"
                    ? "total_revenue"
                    : activeMetric === "platform_fee"
                    ? "total_platform_fee"
                    : "total_net_amount"
                ] ?? 0
              )
        }
        data={chartData}
        onRangeChange={(range) => setTimeRange(range as TimeRange)}
        activeRange={timeRange}
      />

      {/* ── Tables (Tab Switch) ── */}
      <div style={{ marginTop: 32 }}>
        <TabSwitcher
          tabs={[
            {
              label: "Top Performer By Categories",
              key: "top",
              badge: `${shopData.length}.5k`,
            },
            {
              label: "Shop Returns Analytics",
              key: "returns",
              badge: `${shopData.length}.5k`,
            },
          ]}
          defaultTab="top"
        >
          {(activeTab) =>
            activeTab === "top" ? (
              <DataTable<ShopRevenue>
                title=""
                columns={shopRevenueColumns}
                data={shopData}
                pageSize={5}
                searchable
                searchPlaceholder="Search Shop Name"
                onEdit={(row) => console.log("edit", row)}
                onDelete={(row) => console.log("delete", row)}
              />
            ) : (
              <DataTable<ShopRevenue>
                title=""
                columns={shopReturnColumns}
                data={shopData}
                pageSize={5}
                searchable
                searchPlaceholder="Search Shop"
                onEdit={(row) => console.log("edit", row)}
                onDelete={(row) => console.log("delete", row)}
              />
            )
          }
        </TabSwitcher>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              border: "4px solid #f5c518",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </main>
  );
}