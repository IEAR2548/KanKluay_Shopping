"use client";

// client/components/ui/DashboardModals.tsx

import React, { useEffect, useState } from "react";
import { fetchUsers } from "@/lib/api/users";
import { fetchAllShops, Shop } from "@/lib/api/shops";
import { TopShop } from "@/lib/api/dashboard";

// ─── Types ────────────────────────────────────────────────────

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  created_at?: string;
}

interface Order {
  order_id: number;
  shop_name?: string;
  total_amount: string;
  order_status: string;
  order_date: string;
}

export type DetailsType = "users" | "shops" | "transactions" | null;

// ─── Shared helpers ───────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/orders`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  const json = await res.json();
  return (json.data ?? json) as Order[];
}

// ─── Status Badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { bg: string; color: string }> = {
    active:    { bg: "#dcfce7", color: "#16a34a" },
    inactive:  { bg: "#f3f4f6", color: "#6b7280" },
    suspended: { bg: "#fee2e2", color: "#dc2626" },
    completed: { bg: "#dcfce7", color: "#16a34a" },
    pending:   { bg: "#fef9c3", color: "#ca8a04" },
    cancelled: { bg: "#fee2e2", color: "#dc2626" },
    admin:     { bg: "#ede9fe", color: "#7c3aed" },
    buyer:     { bg: "#dbeafe", color: "#2563eb" },
    seller:    { bg: "#fef3c7", color: "#d97706" },
  };
  const style = colorMap[status?.toLowerCase()] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: style.bg,
        color: style.color,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(3px)",
        padding: "24px 16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          width: wide ? 780 : 520,
          maxWidth: "95vw",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "22px 28px 18px",
            borderBottom: "1px solid #f0f0f0",
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontWeight: 800, fontSize: 18, margin: 0, color: "#111" }}>{title}</h2>
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

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 28px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Simple Table ─────────────────────────────────────────────

function SimpleTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
}: {
  columns: { key: string; label: string; render?: (row: T) => React.ReactNode; align?: "left" | "center" | "right" }[];
  data: T[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa", fontSize: 14 }}>
        Loading…
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa", fontSize: 14 }}>
        No data found
      </div>
    );
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#fef9e7" }}>
          <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#888", fontSize: 12 }}>
            No.
          </th>
          {columns.map((col) => (
            <th
              key={col.key}
              style={{
                padding: "10px 12px",
                textAlign: col.align || "left",
                fontWeight: 700,
                color: "#888",
                fontSize: 12,
                whiteSpace: "nowrap",
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr
            key={idx}
            style={{ borderBottom: "1px solid #f5f5f5" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
          >
            <td style={{ padding: "12px 12px", color: "#888", fontSize: 12 }}>{idx + 1}</td>
            {columns.map((col) => (
              <td
                key={col.key}
                style={{ padding: "12px 12px", color: "#222", textAlign: col.align || "left" }}
              >
                {col.render ? col.render(row) : String(row[col.key] ?? "-")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Users Details Modal ──────────────────────────────────────

export function UsersDetailsModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers()
      .then((d) => setData(d ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (r: User) => <StatusBadge status={r.role} /> },
    { key: "status", label: "Status", render: (r: User) => <StatusBadge status={r.status} /> },
    {
      key: "created_at",
      label: "Joined",
      render: (r: User) =>
        r.created_at
          ? new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "-",
    },
  ];

  return (
    <ModalShell title={`Total Users — ${loading ? "…" : data.length} accounts`} onClose={onClose} wide>
      <div style={{ overflowX: "auto" }}>
        <SimpleTable columns={columns} data={data} loading={loading} />
      </div>
    </ModalShell>
  );
}

// ─── Shops Details Modal ──────────────────────────────────────

export function ShopsDetailsModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllShops()
      .then((d) => setData(d ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "shop_name", label: "Shop Name" },
    { key: "shop_description", label: "Description", render: (r: Shop) => (
      <span style={{ color: "#888", fontSize: 12 }}>
        {r.shop_description?.slice(0, 40) || "-"}{r.shop_description?.length > 40 ? "…" : ""}
      </span>
    )},
    { key: "status", label: "Status", render: (r: Shop) => <StatusBadge status={r.status} /> },
    {
      key: "created_at",
      label: "Created",
      render: (r: Shop) =>
        r.created_at
          ? new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "-",
    },
  ];

  return (
    <ModalShell title={`Total Shops — ${loading ? "…" : data.length} shops`} onClose={onClose} wide>
      <div style={{ overflowX: "auto" }}>
        <SimpleTable columns={columns} data={data} loading={loading} />
      </div>
    </ModalShell>
  );
}

// ─── Transactions Details Modal ───────────────────────────────

export function TransactionsDetailsModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders()
      .then((d) => setData(d ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "order_id", label: "Order ID", render: (r: Order) => `#${r.order_id}` },
    { key: "shop_name", label: "Shop", render: (r: Order) => r.shop_name || "-" },
    {
      key: "total_amount",
      label: "Amount",
      align: "right" as const,
      render: (r: Order) => `฿${Number(r.total_amount).toLocaleString()}`,
    },
    { key: "order_status", label: "Status", render: (r: Order) => <StatusBadge status={r.order_status} /> },
    {
      key: "order_date",
      label: "Date",
      render: (r: Order) =>
        new Date(r.order_date).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        }),
    },
  ];

  const total = data.reduce((s, r) => s + Number(r.total_amount), 0);

  return (
    <ModalShell title={`Total Transactions — ${loading ? "…" : data.length} orders`} onClose={onClose} wide>
      {/* Summary row */}
      {!loading && data.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 20,
            padding: "14px 16px",
            background: "#fef9e7",
            borderRadius: 12,
          }}
        >
          {[
            { label: "Total Orders", value: data.length.toLocaleString() },
            { label: "Total Revenue", value: `฿${total.toLocaleString()}` },
            {
              label: "Completed",
              value: data.filter((o) => o.order_status === "completed").length.toString(),
            },
            {
              label: "Pending",
              value: data.filter((o) => o.order_status === "pending").length.toString(),
            },
            {
              label: "Cancelled",
              value: data.filter((o) => o.order_status === "cancelled").length.toString(),
            },
          ].map((item) => (
            <div key={item.label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#111" }}>{item.value}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <SimpleTable columns={columns} data={data} loading={loading} />
      </div>
    </ModalShell>
  );
}

// ─── View Insight Modal ───────────────────────────────────────

export function InsightModal({
  onClose,
  topShops,
}: {
  onClose: () => void;
  topShops: TopShop[];
}) {
  const maxRevenue = Math.max(...topShops.map((s) => Number(s.total_revenue)), 1);
  const totalRevenue = topShops.reduce((s, shop) => s + Number(shop.total_revenue), 0);
  const totalOrders = topShops.reduce((s, shop) => s + Number(shop.total_orders), 0);

  const barColors = ["#f5c518", "#4a6cf7", "#22c55e", "#f97316", "#ec4899"];

  return (
    <ModalShell title="Shop Sales Insight" onClose={onClose} wide>
      {/* KPI row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Top Shops Shown", value: topShops.length.toString() },
          { label: "Combined Revenue", value: `฿${totalRevenue.toLocaleString()}` },
          { label: "Combined Orders", value: totalOrders.toLocaleString() },
          { label: "Avg Revenue / Shop", value: `฿${topShops.length ? Math.round(totalRevenue / topShops.length).toLocaleString() : 0}` },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              flex: 1,
              background: "#fef9e7",
              borderRadius: 12,
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18, color: "#111" }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <h3 style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 16 }}>
        Revenue by Shop
      </h3>
      {topShops.length === 0 ? (
        <div style={{ textAlign: "center", color: "#aaa", padding: "32px 0" }}>No shop data</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {topShops.map((shop, idx) => {
            const pct = (Number(shop.total_revenue) / maxRevenue) * 100;
            return (
              <div key={shop.shop_id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#222" }}>{shop.shop_name}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>
                    ฿{Number(shop.total_revenue).toLocaleString()}
                    <span style={{ fontWeight: 400, color: "#aaa", marginLeft: 6, fontSize: 12 }}>
                      ({shop.total_orders} orders)
                    </span>
                  </span>
                </div>
                <div style={{ height: 10, background: "#f0f0f0", borderRadius: 6, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: barColors[idx % barColors.length],
                      borderRadius: 6,
                      transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                  {pct.toFixed(1)}% of top performer
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Revenue share donut-style legend */}
      <h3 style={{ fontWeight: 700, fontSize: 15, color: "#111", margin: "28px 0 14px" }}>
        Revenue Share
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {topShops.map((shop, idx) => {
          const share = totalRevenue > 0 ? ((Number(shop.total_revenue) / totalRevenue) * 100).toFixed(1) : "0";
          return (
            <div
              key={shop.shop_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: "#f7f7f7",
                borderRadius: 20,
                fontSize: 13,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: barColors[idx % barColors.length],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 600, color: "#222" }}>{shop.shop_name}</span>
              <span style={{ color: "#888" }}>{share}%</span>
            </div>
          );
        })}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          marginTop: 28,
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
    </ModalShell>
  );
}