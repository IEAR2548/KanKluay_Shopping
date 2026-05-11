"use client";

// client/app/(admin)/admin/dashboard/page.tsx

import React, { useEffect, useState, useCallback } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { MiniBarChart } from "@/components/ui/MiniBarChart";
import { ProvinceList } from "@/components/ui/ProvinceList";
import {
  UsersDetailsModal,
  ShopsDetailsModal,
  TransactionsDetailsModal,
  InsightModal,
} from "@/components/ui/DashboardModals";
import {
  fetchDashboardSummary,
  fetchTransactionsTrend,
  fetchSubMetrics,
  fetchRecentUsers,
  fetchTopShops,
  fetchGrowthStats,
  SummaryCards,
  TrendPoint,
  SubMetrics,
  RecentUsers,
  TopShop,
  GrowthStats,
} from "@/lib/api/dashboard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Helpers ─────────────────────────────────────────────────

function formatK(val: string | number): string {
  const n = Number(val);
  if (isNaN(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function calcChange(current: string, previous: string): number {
  const c = Number(current);
  const p = Number(previous);
  if (p === 0) return 0;
  return Math.round(((c - p) / p) * 100 * 10) / 10;
}

type TrendRange = "lastWeek" | "lastMonth";
// which details modal is open
type DetailsModal = "users" | "shops" | "transactions" | null;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#1a1a1a",
          color: "#fff",
          borderRadius: 8,
          padding: "8px 14px",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <div style={{ color: "#aaa", fontSize: 11 }}>{label}</div>
        <div>{Number(payload[0].value).toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

// ─── Sub-metric mini card ─────────────────────────────────────

function SubMetricCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 100,
        padding: "14px 16px",
        background: active ? "#fff" : "transparent",
        borderRadius: 10,
        cursor: "pointer",
        borderBottom: active ? "3px solid #f5c518" : "3px solid transparent",
        transition: "all 0.15s",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 20, color: "#111" }}>{formatK(value)}</div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryCards | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [subMetrics, setSubMetrics] = useState<SubMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUsers | null>(null);
  const [topShops, setTopShops] = useState<TopShop[]>([]);
  const [growth, setGrowth] = useState<GrowthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendRange, setTrendRange] = useState<TrendRange>("lastWeek");
  const [activeSubMetric, setActiveSubMetric] = useState<string>("total_users");

  // ── Modal state ──────────────────────────────────────────
  const [detailsModal, setDetailsModal] = useState<DetailsModal>(null);
  const [insightOpen, setInsightOpen] = useState(false);

  const loadAll = useCallback(async (range: TrendRange) => {
    try {
      setLoading(true);
      const [sum, tr, sub, ru, shops, gr] = await Promise.all([
        fetchDashboardSummary(),
        fetchTransactionsTrend({ range }),
        fetchSubMetrics(),
        fetchRecentUsers(),
        fetchTopShops({ limit: "5" }),
        fetchGrowthStats(),
      ]);
      setSummary(sum);
      setTrend(tr);
      setSubMetrics(sub);
      setRecentUsers(ru);
      setTopShops(shops);
      setGrowth(gr);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll(trendRange);
  }, [trendRange, loadAll]);

  // ─── Chart data ───────────────────────────────────────────
  const chartData = trend.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
    value: Number(d.total_orders),
    revenue: Number(d.revenue),
  }));

  // ─── Mini bar chart data ──────────────────────────────────
  const miniBarData = (recentUsers?.per_minute ?? []).map((p, i) => ({
    label: `min ${i + 1}`,
    value: Number(p.users_last_30min),
  }));
  const miniDisplay =
    miniBarData.length > 0
      ? miniBarData
      : Array.from({ length: 20 }, (_, i) => ({ label: `m${i}`, value: Math.random() * 10 }));

  // ─── Growth calc ──────────────────────────────────────────
  const userChange = growth ? calcChange(growth.new_users_30d, growth.prev_users_30d) : 0;
  const shopChange = growth ? calcChange(growth.new_shops_30d, growth.prev_shops_30d) : 0;
  const txChange   = growth ? calcChange(growth.new_orders_30d, growth.prev_orders_30d) : 0;

  // ─── Sub-metrics config ───────────────────────────────────
  const subMetricItems = [
    { key: "total_users",        label: "Total Users",        value: subMetrics?.total_users        ?? "0" },
    { key: "total_shops",        label: "Total Shops",        value: subMetrics?.total_shops        ?? "0" },
    { key: "total_transactions", label: "Total Transactions", value: subMetrics?.total_transactions ?? "0" },
    { key: "pending_approvals",  label: "Pending Approvals",  value: subMetrics?.pending_approvals  ?? "0" },
    { key: "total_revenue",      label: "Total Revenue",      value: subMetrics?.total_revenue      ?? "0" },
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
        Dashboard
      </h1>

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <StatCard
            title="Total User"
            value={loading ? "…" : formatK(summary?.total_users ?? 0)}
            change={userChange}
            previousLabel="(+ 235)"
            onDetails={() => setDetailsModal("users")}
          />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <StatCard
            title="Total Shop"
            value={loading ? "…" : formatK(summary?.total_shops ?? 0)}
            change={shopChange}
            previousLabel="(- 235)"
            onDetails={() => setDetailsModal("shops")}
          />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <StatCard
            title="Total Transactions"
            value={loading ? "…" : formatK(summary?.total_transactions ?? 0)}
            change={txChange}
            previousLabel="(+ 235K)"
            onDetails={() => setDetailsModal("transactions")}
          />
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* Left: Trend chart */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 16,
            padding: "24px 28px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, fontSize: 20, margin: 0 }}>Transactions Trend</h2>
            <div style={{ display: "flex", gap: 4 }}>
              {(["lastWeek", "lastMonth"] as TrendRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 16,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: trendRange === r ? "#f5c518" : "#f0f0f0",
                    color: trendRange === r ? "#111" : "#888",
                    transition: "all 0.15s",
                  }}
                >
                  {r === "lastWeek" ? "Last week" : "Last Month"}
                </button>
              ))}
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>⋮</button>
            </div>
          </div>

          {/* Sub-metric tabs */}
          <div
            style={{
              display: "flex",
              gap: 0,
              background: "#f7f7f7",
              borderRadius: 12,
              padding: 4,
              marginBottom: 20,
              overflowX: "auto",
            }}
          >
            {subMetricItems.map((item) => (
              <SubMetricCard
                key={item.key}
                label={item.label}
                value={item.value}
                active={activeSubMetric === item.key}
                onClick={() => setActiveSubMetric(item.key)}
              />
            ))}
          </div>

          {/* Area chart */}
          <div style={{ width: "100%", height: 260, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5c518" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f5c518" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#aaa" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#aaa" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f5c518"
                  strokeWidth={3}
                  fill="url(#dashGold)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#f5c518", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Users in last 30 min */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "20px 20px 16px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>
                Users in last 30 minutes
              </span>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>⋮</button>
            </div>
            <div style={{ fontWeight: 800, fontSize: 28, color: "#111", marginBottom: 2 }}>
              {loading ? "…" : formatK(recentUsers?.total ?? 0)}
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>Users per minute</div>
            <MiniBarChart data={miniDisplay} height={60} />
          </div>

          {/* Top Shops */}
          <ProvinceList
            shops={topShops}
            onViewInsight={() => setInsightOpen(true)}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      {detailsModal === "users"        && <UsersDetailsModal        onClose={() => setDetailsModal(null)} />}
      {detailsModal === "shops"        && <ShopsDetailsModal        onClose={() => setDetailsModal(null)} />}
      {detailsModal === "transactions" && <TransactionsDetailsModal onClose={() => setDetailsModal(null)} />}
      {insightOpen                     && <InsightModal topShops={topShops} onClose={() => setInsightOpen(false)} />}

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