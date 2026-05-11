"use client";

// client/app/(admin)/admin/reports/page.tsx

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  endDate.setDate(now.getDate() + 1);
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
    label: new Date(d.date).toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    }),
    value: Number(d[key]) || 0,
  }));
}

// ─── Shop Filter Bar ──────────────────────────────────────────

interface ShopFilterBarProps {
  shops: ShopRevenue[];
  selectedIds: Set<number>;
  onChange: (ids: Set<number>) => void;
}

function ShopFilterBar({ shops, selectedIds, onChange }: ShopFilterBarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const allSelected = selectedIds.size === 0;

  const toggleShop = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };

  const clearAll = () => onChange(new Set());

  const selectedCount = selectedIds.size;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
        flexWrap: "wrap",
      }}
    >
      {/* Label */}
      <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Filter by Shop:</span>

      {/* "All Shops" chip */}
      <button
        onClick={clearAll}
        style={{
          padding: "6px 14px",
          borderRadius: 20,
          border: `1.5px solid ${allSelected ? "#f5c518" : "#e0e0e0"}`,
          background: allSelected ? "#f5c518" : "#fff",
          color: allSelected ? "#111" : "#555",
          fontWeight: allSelected ? 700 : 400,
          fontSize: 13,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        All Shops
      </button>

      {/* Selected shop chips */}
      {shops
        .filter((s) => selectedIds.has(s.shop_id))
        .map((s) => (
          <button
            key={s.shop_id}
            onClick={() => toggleShop(s.shop_id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 20,
              border: "1.5px solid #f5c518",
              background: "#fffbea",
              color: "#b8860b",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {s.shop_name}
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#f5c518",
                color: "#111",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              ✕
            </span>
          </button>
        ))}

      {/* Dropdown button */}
      <div ref={ref} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 20,
            border: `1.5px solid ${open ? "#f5c518" : "#e0e0e0"}`,
            background: open ? "#fffbea" : "#fff",
            color: open ? "#b8860b" : "#555",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <span>🏪</span>
          {selectedCount > 0 ? `${selectedCount} selected` : "Select Shops"}
          <span
            style={{
              display: "inline-block",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
              fontSize: 10,
            }}
          >
            ▼
          </span>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              zIndex: 300,
              minWidth: 220,
              overflow: "hidden",
              animation: "dropIn 0.15s ease",
            }}
          >
            <style>{`
              @keyframes dropIn {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 16px 8px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1 }}>
                SELECT SHOPS
              </span>
              {selectedCount > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    fontSize: 11,
                    color: "#f5c518",
                    fontWeight: 600,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Shop list */}
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {shops.length === 0 ? (
                <div style={{ padding: "16px", textAlign: "center", color: "#bbb", fontSize: 13 }}>
                  No shops available
                </div>
              ) : (
                shops.map((shop) => {
                  const checked = selectedIds.has(shop.shop_id);
                  return (
                    <div
                      key={shop.shop_id}
                      onClick={() => toggleShop(shop.shop_id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        cursor: "pointer",
                        background: checked ? "#fffbea" : "transparent",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        if (!checked) e.currentTarget.style.background = "#f9f9f9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = checked ? "#fffbea" : "transparent";
                      }}
                    >
                      {/* Checkbox */}
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: `2px solid ${checked ? "#f5c518" : "#ddd"}`,
                          background: checked ? "#f5c518" : "#fff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      >
                        {checked && "✓"}
                      </span>

                      {/* Shop info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: checked ? 600 : 400,
                            color: "#222",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {shop.shop_name}
                        </div>
                        <div style={{ fontSize: 11, color: "#999" }}>SID{shop.shop_id}</div>
                      </div>

                      {/* Revenue badge */}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#888",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatK(shop.total_revenue)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "8px 16px",
                borderTop: "1px solid #f0f0f0",
                fontSize: 12,
                color: "#aaa",
                textAlign: "right",
              }}
            >
              {selectedCount === 0
                ? `${shops.length} shops total`
                : `${selectedCount} of ${shops.length} selected`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
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

// ─── Column definitions ───────────────────────────────────────

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

<<<<<<< HEAD
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
=======
  // ── Shop filter state ──
  const [selectedShopIds, setSelectedShopIds] = useState<Set<number>>(new Set());

  const loadData = useCallback(async (range: TimeRange) => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(range);
      const [sum, daily, shops] = await Promise.all([
        fetchSummary(),
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
  }, []);
>>>>>>> 6df42f224307ce24c8f6e6efb21b154c8c580670

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

<<<<<<< HEAD
  const statCards: { title: string; metric: ActiveMetric; valueKey: keyof SummaryData; prevKey: keyof SummaryData }[] = [
    { title: "Total Sales",   metric: "revenue",      valueKey: "total_revenue",       prevKey: "total_revenue" },
    { title: "Total Fees",    metric: "platform_fee", valueKey: "total_platform_fee",  prevKey: "total_platform_fee" },
    { title: "Net Revenue",   metric: "net_amount",   valueKey: "total_net_amount",    prevKey: "total_net_amount" },
=======
  // ── Filtered shop data ──
  const filteredShopData =
    selectedShopIds.size === 0
      ? shopData
      : shopData.filter((s) => selectedShopIds.has(s.shop_id));

  const statCards: { title: string; metric: ActiveMetric; valueKey: keyof SummaryData }[] = [
    { title: "Total Sales", metric: "revenue", valueKey: "total_revenue" },
    { title: "Total Fees", metric: "platform_fee", valueKey: "total_platform_fee" },
    { title: "Net Revenue", metric: "net_amount", valueKey: "total_net_amount" },
>>>>>>> 6df42f224307ce24c8f6e6efb21b154c8c580670
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
          {(activeTab) => (
            <>
              {/* ── Shop Filter Bar (อยู่ใต้ tab เหนือตาราง) ── */}
              <ShopFilterBar
                shops={shopData}
                selectedIds={selectedShopIds}
                onChange={setSelectedShopIds}
              />

              {/* Filter result label */}
              {selectedShopIds.size > 0 && (
                <div
                  style={{
                    marginBottom: 12,
                    fontSize: 12,
                    color: "#888",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#f5c518",
                    }}
                  />
                  Showing {filteredShopData.length} of {shopData.length} shops
                </div>
              )}

              {activeTab === "top" ? (
                <DataTable<ShopRevenue>
                  title=""
                  columns={shopRevenueColumns}
                  data={filteredShopData}
                  pageSize={5}
                  searchable
                  searchPlaceholder="Search Shop Name"
                />
              ) : (
                <DataTable<ShopRevenue>
                  title=""
                  columns={shopReturnColumns}
                  data={filteredShopData}
                  pageSize={5}
                  searchable
                  searchPlaceholder="Search Shop Name"
                />
              )}
            </>
          )}
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