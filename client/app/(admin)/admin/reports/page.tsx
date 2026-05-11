"use client";

// client/app/(admin)/admin/reports/page.tsx

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

  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 1); // +1 เพื่อ cover timezone
  const end = endDate.toISOString().split("T")[0];

  const start = new Date(now);
  if (range === "lastWeek") start.setDate(now.getDate() - 7);
  else if (range === "lastMonth") start.setMonth(now.getMonth() - 1);
  else if (range === "lastQuarter") start.setMonth(now.getMonth() - 3);
  else start.setFullYear(now.getFullYear() - 1);

  return { startDate: start.toISOString().split("T")[0], endDate: end };
}

function toChartData(daily: DailyRevenue[], key: ActiveMetric): { label: string; value: number }[] {
  return daily.map((d) => ({
    // ใช้ UTC date ไม่งั้น label วันจะเพี้ยน -1 วัน
    label: new Date(d.date).toLocaleDateString("en-US", { 
      weekday: "short",
      timeZone: "UTC" // ← เพิ่มตรงนี้
    }),
    value: Number(d[key]) || 0,
  }));
}

// ─── Details Modal ────────────────────────────────────────────

interface DetailsModalProps {
  title: string;
  summary: SummaryData;
  onClose: () => void;
}

function DetailsModal({ title, summary, onClose }: DetailsModalProps) {
  const items = [
    { label: "Total Orders", value: Number(summary.total_orders).toLocaleString() },
    { label: "Total Revenue", value: `฿ ${Number(summary.total_revenue).toLocaleString()}` },
    { label: "Platform Fee", value: `฿ ${Number(summary.total_platform_fee).toLocaleString()}` },
    { label: "Net Amount", value: `฿ ${Number(summary.total_net_amount).toLocaleString()}` },
    { label: "Completed Orders", value: Number(summary.completed_orders).toLocaleString() },
    { label: "Pending Orders", value: Number(summary.pending_orders).toLocaleString() },
    { label: "Cancelled Orders", value: Number(summary.cancelled_orders).toLocaleString() },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "32px 36px",
          width: 420,
          maxWidth: "90vw",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, margin: 0 }}>{title} — Details</h2>
          <button
            onClick={onClose}
            style={{
              background: "#f5f5f5",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
              color: "#555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((item, idx) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0",
                borderBottom: idx < items.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <span style={{ fontSize: 14, color: "#666" }}>{item.label}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            marginTop: 24,
            width: "100%",
            padding: "12px 0",
            borderRadius: 24,
            border: "none",
            background: "#f5c518",
            color: "#111",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Column definitions (ไม่มี edit/delete) ──────────────────

const shopRevenueColumns: Column<ShopRevenue>[] = [
  { key: "shop_id", label: "ShopId" },
  { key: "shop_name", label: "Shop Name" },
  { key: "total_orders", label: "Transactions", align: "center" },
  { key: "total_revenue", label: "Total Sales", align: "right", render: (r) => formatK(r.total_revenue) },
];

const shopReturnColumns: Column<ShopRevenue>[] = [
  { key: "shop_id", label: "ShopId" },
  { key: "shop_name", label: "Shop Name" },
  { key: "total_orders", label: "Completed Order", align: "center" },
  {
    key: "total_net_amount",
    label: "Total Returned",
    align: "center",
    render: (r) => Math.round(Number(r.total_orders) * 0.1).toLocaleString(),
  },
  {
    key: "shop_status",
    label: "Returning Rate",
    align: "center",
    render: () => "10%",
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [prevSummary, setPrevSummary] = useState<SummaryData | null>(null);

  // ── Compute previous date range (same window, shifted back) ──
  function getPrevDateRange(range: TimeRange): { startDate: string; endDate: string } {
    const now = new Date();
    const days = range === "lastWeek" ? 7 : range === "lastMonth" ? 30 : range === "lastQuarter" ? 90 : 365;
    const prevEnd = new Date(now);
    prevEnd.setDate(now.getDate() - days);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevEnd.getDate() - days);
    return {
      startDate: prevStart.toISOString().split("T")[0],
      endDate: prevEnd.toISOString().split("T")[0],
    };
  }

  function calcChange(curr: string | undefined, prev: string | undefined): number {
    const c = Number(curr ?? 0);
    const p = Number(prev ?? 0);
    if (p === 0) return 0;
    return Math.round(((c - p) / p) * 1000) / 10;
  }

  const loadData = useCallback(
    async (range: TimeRange) => {
      try {
        setLoading(true);
        const { startDate, endDate } = getDateRange(range);
        const [sum, daily, shops, prevSum] = await Promise.all([
          fetchSummary(),
          fetchDailyRevenue({ startDate, endDate }),
          fetchRevenueByShop({ startDate, endDate }),
          fetchSummary(getPrevDateRange(range)),
        ]);
        setSummary(sum);
        setChartData(toChartData(daily, activeMetric));
        setShopData(shops);
        setPrevSummary(prevSum);
      } catch (err) {
        console.error("Failed to load report data:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData(timeRange);
  }, [timeRange, loadData]);

  const handleMetricClick = (metric: ActiveMetric) => {
    setActiveMetric(metric);
    const { startDate, endDate } = getDateRange(timeRange);
    fetchDailyRevenue({ startDate, endDate }).then((daily) => {
      setChartData(toChartData(daily, metric));
    });
  };

  const handleDetails = (title: string) => {
    setModalTitle(title);
    setModalOpen(true);
  };

  const statCards: { title: string; metric: ActiveMetric; valueKey: keyof SummaryData; prevKey: keyof SummaryData }[] = [
    { title: "Total Sales",   metric: "revenue",      valueKey: "total_revenue",       prevKey: "total_revenue" },
    { title: "Total Fees",    metric: "platform_fee", valueKey: "total_platform_fee",  prevKey: "total_platform_fee" },
    { title: "Net Revenue",   metric: "net_amount",   valueKey: "total_net_amount",    prevKey: "total_net_amount" },
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
      <h1 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24, color: "#111" }}>
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
              outline: activeMetric === card.metric ? "2.5px solid #f5c518" : "2.5px solid transparent",
              borderRadius: 16,
              transition: "outline 0.15s",
            }}
          >
            <StatCard
              title={card.title}
              value={loading ? "…" : formatK(summary?.[card.valueKey] ?? 0)}
              change={calcChange(summary?.[card.valueKey], prevSummary?.[card.prevKey])}
              previousLabel={`prev: ${formatK(prevSummary?.[card.prevKey] ?? 0)}`}
              onDetails={() => handleDetails(card.title)}
            />
          </div>
        ))}
      </div>

      {/* ── Revenue Chart ── */}
      <RevenueChart
        metric={activeMetric}
        metricLabel={
          activeMetric === "revenue" ? "Total Sales"
          : activeMetric === "platform_fee" ? "Total Fees"
          : "Net Revenue"
        }
        metricValue={
          loading ? "…"
          : formatK(
              summary?.[
                activeMetric === "revenue" ? "total_revenue"
                : activeMetric === "platform_fee" ? "total_platform_fee"
                : "total_net_amount"
              ] ?? 0
            )
        }
        data={chartData}
        onRangeChange={(range) => setTimeRange(range as TimeRange)}
        activeRange={timeRange}
      />

      {/* ── Tables ── */}
      <div style={{ marginTop: 32 }}>
        <TabSwitcher
          tabs={[
            { label: "Top Performer By Categories", key: "top", badge: `${shopData.length}` },
            { label: "Shop Returns Analytics", key: "returns", badge: `${shopData.length}` },
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
              />
            ) : (
              <DataTable<ShopRevenue>
                title=""
                columns={shopReturnColumns}
                data={shopData}
                pageSize={5}
                searchable
                searchPlaceholder="Search Shop Name"
              />
            )
          }
        </TabSwitcher>
      </div>

      {/* ── Details Modal ── */}
      {modalOpen && summary && (
        <DetailsModal
          title={modalTitle}
          summary={summary}
          onClose={() => setModalOpen(false)}
        />
      )}

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