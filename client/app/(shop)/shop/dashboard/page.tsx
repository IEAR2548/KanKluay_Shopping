"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import ShopSidebar from "@/components/layout/ShopSidebar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Order {
  order_id: number;
  order_date: string;
  customer_name: string;
  shipping_status: string;
  order_status: string;
  total_amount: number;
}

// ─── Mock data ────────────────────────────────────────────────
const WEEKLY_SALES = [
  { day: "Mon", amount: 78 },
  { day: "Tue", amount: 62 },
  { day: "Wed", amount: 385 },
  { day: "Thu", amount: 212 },
  { day: "Fri", amount: 150 },
  { day: "Sat", amount: 276 },
  { day: "Sun", amount: 199 },
];
const TODAY_IDX = 2; // Wed highlight

const TOTAL_SALES = 350000;
const TOTAL_ORDERS = 1500;
const SALES_CHANGE = 2350;
const ORDERS_CHANGE = -35;
const SALES_PCT = 10.4;
const ORDERS_PCT = 7.4;

// ─── Status badge ─────────────────────────────────────────────
const STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  processing: { label: "Processing", color: "#555", bg: "#e2e8f0" },
  pending: { label: "Pending", color: "#555", bg: "#e2e8f0" },
  shipping: { label: "To Ship", color: "#fff", bg: "#f5a623" },
  delivered: { label: "Delivered", color: "#fff", bg: "#28a745" },
  cancelled: { label: "Cancelled", color: "#fff", bg: "#dc3545" },
  returned: { label: "Returned", color: "#fff", bg: "#6c757d" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: "#fff", bg: "#888" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap" as const,
      }}
    >
      {s.label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [shopId, setShopId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"Pending" | "To Ship">(
    "To Ship",
  );
  const [stats, setStats] = useState({
    total_sales: 0,
    total_orders: 0,
    sales_diff: 0,
    orders_diff: 0,
    sales_pct: 0,
    orders_pct: 0,
  });
  const [weekly, setWeekly] = useState<{ day: string; amount: number }[]>([]);

  useEffect(() => {
    const fetchShop = async () => {
      if (!user?.user_id) return;
      try {
        // ลองหา shopId จาก URL ก่อน
        const params = new URLSearchParams(window.location.search);
        const urlShopId = params.get('shopId');
        
        if (urlShopId) {
          setShopId(Number(urlShopId));
          return;
        }

        const res = await fetch(`${API}/shops/user/${user.user_id}`);
        const data = await res.json();
        
        // data คือ array ของ shops
        const shopList = Array.isArray(data) ? data : (data.data || []);
        if (shopList.length > 0) {
          setShopId(shopList[0].shop_id);
        }
      } catch (err) {
        console.error("Fetch shop error:", err);
      }
    };
    if (user) fetchShop();
  }, [user]);

  useEffect(() => {
    if (shopId) {
      fetchOrders();
      fetchStats();
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [shopId, user, userLoading]);

  const fetchStats = async () => {
    if (!shopId) return;
    try {
      const res = await fetch(`${API}/shops/${shopId}/stats`);
      const json = await res.json();
      if (json.data) {
        setStats(json.data.stats);
        setWeekly(json.data.weekly ?? []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/orders/shop/${shopId}`);
      const json = await res.json();
      setOrders(json.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = weekly.length > 0 ? weekly : WEEKLY_SALES;
  const MAX_BAR   = Math.max(...chartData.map(d => d.amount), 1);

  const recentOrders = orders
    .filter(o => {
      if (activeFilter === "Pending")  return o.shipping_status === "pending" || o.shipping_status === "processing";
      if (activeFilter === "To Ship")  return o.shipping_status === "shipping";
      return true;
    })
    .slice(0, 6);

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <div style={styles.layout}>
        {/* ─── Sidebar ─── */}
        <ShopSidebar />

        {/* ─── Content ─── */}
        <div style={styles.content}>
          {/* header */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>Overview</div>
              <div style={styles.pageSubtitle}>Visual summary of your sales performance.</div>
            </div>
            <button style={styles.exportBtn}>Export Report</button>
          </div>

          <div style={styles.mainRow}>
            {/* ─── Left column ─── */}
            <div style={styles.leftCol}>
              {/* Stats cards */}
              <div style={styles.statsRow}>
                {/* Total Sales */}
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Total Sales</div>
                  <div style={styles.statRow}>
                    <span style={styles.statValue}>$ {stats.total_sales.toLocaleString()}</span>
                    <span style={{ ...styles.statPct, color: "#28a745" }}>
                      {stats.sales_pct >= 0 ? "↑" : "↓"} {Math.abs(stats.sales_pct)}%
                    </span>
                  </div>
                  <div style={styles.statSub}>
                    Previous Month{" "}
                    <span style={{ color: "#28a745" }}>
                      ({stats.sales_diff >= 0 ? "+" : ""} $ {stats.sales_diff.toLocaleString()})
                    </span>
                  </div>
                </div>

                {/* Orders */}
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>Orders</div>
                  <div style={styles.statRow}>
                    <span style={styles.statValue}>{stats.total_orders.toLocaleString()}</span>
                    <span style={{ ...styles.statPct, color: "#dc3545" }}>
                      {stats.orders_pct >= 0 ? "↑" : "↓"} {Math.abs(stats.orders_pct)}%
                    </span>
                  </div>
                  <div style={styles.statSub}>
                    Previous Month{" "}
                    <span style={{ color: "#dc3545" }}>
                      ({stats.orders_diff >= 0 ? "+" : ""}{stats.orders_diff})
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Sales chart */}
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>Weekly Sales</div>
                <div style={styles.chart}>
                  {chartData.map((d, i) => {
                    const pct     = (d.amount / MAX_BAR) * 100;
                    const isToday = i === TODAY_IDX;
                    return (
                      <div key={d.day} style={styles.barCol}>
                        <div style={styles.barAmount}>{d.amount}</div>
                        <div style={styles.barWrapper}>
                          <div style={{
                            ...styles.bar,
                            height: `${pct}%`,
                            background: isToday ? "#f5a623" : "#d0d5dd",
                          }} />
                        </div>
                        <div style={styles.barDay}>{d.day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ─── Right: Recent Orders ─── */}
            <div style={styles.recentCard}>
              <div style={styles.recentTitle}>Recent Orders</div>
              <div style={styles.recentSub}>
                Orders that need to be ship as soon as possible
              </div>

              {/* Filter buttons */}
              <div style={styles.filterRow}>
                {(["Pending", "To Ship"] as const).map((f) => (
                  <button
                    key={f}
                    style={{
                      ...styles.filterBtn,
                      ...(activeFilter === f ? styles.filterBtnActive : {}),
                    }}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Orders list */}
              <div style={styles.recentHeader}>
                <span style={{ flex: 1 }}>Order ID</span>
                <span style={{ width: 100 }}>Customer</span>
                <span style={{ width: 80, textAlign: "right" as const }}>Status</span>
              </div>

              {loading ? (
                <div style={styles.empty}>กำลังโหลด...</div>
              ) : recentOrders.length === 0 ? (
                <div style={styles.empty}>ไม่มี Order</div>
              ) : (
                recentOrders.map((o) => (
                  <div
                    key={o.order_id}
                    style={styles.recentRow}
                    onClick={() => router.push("/shop/orders")}
                  >
                    <span style={{ flex: 1, color: "#3182ce", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      #{`ORD-${o.order_id}`}
                    </span>
                    <span style={{ width: 100, fontSize: 13 }}>{o.customer_name}</span>
                    <span style={{ width: 80, textAlign: "right" as const }}>
                      <StatusBadge status={o.shipping_status} />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page:    { fontFamily: "Sarabun, sans-serif", background: "#f5f5f5", minHeight: "100vh" },
  layout:  { display: "flex", minHeight: "calc(100vh - 56px)" },

  sidebar:    { width: 160, background: "#3d2b00", padding: 0, flexShrink: 0 },
  sellerMenu: {
    color: "#f5a623", fontWeight: 700, fontSize: 13,
    padding: "16px 20px", borderBottom: "1px solid #5a4010",
  },
  sidebarItem: { padding: "14px 20px", color: "#ccc", fontSize: 14, cursor: "pointer" },
  sidebarActive: { background: "#f5a623", color: "#3d2b00", fontWeight: 700 },

  content:     { flex: 1, padding: 28 },
  pageHeader:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  pageTitle:   { fontSize: 28, fontWeight: 800 },
  pageSubtitle:{ fontSize: 13, color: "#888", marginTop: 4 },
  exportBtn: {
    background: "#f5a623", border: "none",
    padding: "10px 24px", borderRadius: 6,
    fontWeight: 700, fontSize: 14, cursor: "pointer",
  },

  mainRow: { display: "flex", gap: 20, alignItems: "flex-start" },
  leftCol: { flex: 1, display: "flex", flexDirection: "column" as const, gap: 16 },

  statsRow: { display: "flex", gap: 16 },
  statCard: {
    flex: 1, background: "#fff", borderRadius: 12,
    padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  statLabel: { fontSize: 13, color: "#888", marginBottom: 8 },
  statRow:   { display: "flex", alignItems: "center", gap: 12, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: 800 },
  statPct:   { fontSize: 14, fontWeight: 600 },
  statSub:   { fontSize: 12, color: "#888" },

  chartCard: {
    background: "#fff", borderRadius: 12,
    padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  chartTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20 },
  chart: {
    display: "flex", alignItems: "flex-end",
    gap: 8, height: 200, borderBottom: "1px solid #eee",
    paddingBottom: 0,
  },
  barCol:    { flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 },
  barAmount: { fontSize: 11, color: "#888" },
  barWrapper:{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  bar:       { width: "100%", borderRadius: "4px 4px 0 0", minHeight: 4, transition: "height 0.3s" },
  barDay:    { fontSize: 12, color: "#888", marginTop: 6 },

  recentCard: {
    width: 280, flexShrink: 0, background: "#fff",
    borderRadius: 12, padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  recentTitle: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  recentSub:   { fontSize: 12, color: "#888", marginBottom: 14, lineHeight: 1.5 },

  filterRow: { display: "flex", gap: 8, marginBottom: 16 },
  filterBtn: {
    border: "none", background: "#e2e8f0",
    padding: "5px 14px", borderRadius: 20,
    fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#555",
  },
  filterBtnActive: { background: "#f5a623", color: "#fff" },

  recentHeader: {
    display: "flex", fontSize: 12, color: "#aaa",
    paddingBottom: 8, borderBottom: "1px solid #f0f0f0",
    marginBottom: 8,
  },
  recentRow: {
    display: "flex", alignItems: "center",
    paddingTop: 10, paddingBottom: 10,
    borderBottom: "1px solid #f9f9f9",
    cursor: "pointer",
  },
  empty: { padding: "24px 0", textAlign: "center" as const, color: "#aaa", fontSize: 13 },
};