"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import ShopSidebar from "@/components/layout/ShopSidebar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Types ───────────────────────────────────────────────────
interface Order {
  order_id: number;
  order_date: string;
  customer_name: string;
  shipping_status: string;
  order_status: string;
  total_amount: number;
}

interface OrderDetail {
  order_id: number;
  order_date: string;
  customer_name: string;
  shipping_status: string;
  order_status: string;
  total_amount: number;
  recipient_name: string;
  address_phone: string;
  address_detail: string;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    price_at_purchase: number;
    image_url?: string;
  }[];
}

const TABS = ["All", "Pending", "To Ship", "Shipped", "Cancelled"];

const STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  delivered: { label: "Delivered", color: "#fff", bg: "#28a745" },
  shipping: { label: "Shipping", color: "#fff", bg: "#f5a623" },
  pending: { label: "Pending", color: "#555", bg: "#e2e8f0" },
  returned: { label: "Returned", color: "#fff", bg: "#6c757d" },
  completed: { label: "Completed", color: "#fff", bg: "#28a745" },
  cancelled: { label: "Cancelled", color: "#fff", bg: "#dc3545" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: "#fff", bg: "#888" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      ", " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return iso;
  }
}

// ─── Main Page ───────────────────────────────────────────────
export default function SellerOrdersPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [shopId, setShopId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [selected, setSelected] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchShop = async () => {
      if (!user?.user_id) return;
      try {
        const params = new URLSearchParams(window.location.search);
        const urlShopId = params.get('shopId');
        if (urlShopId) {
          setShopId(Number(urlShopId));
          return;
        }

        const res = await fetch(`${API}/shops/user/${user.user_id}`);
        const data = await res.json();
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
    if (shopId) fetchOrders();
    else if (!userLoading && !user) setLoading(false);
  }, [shopId, user, userLoading]);

  useEffect(() => {
    let list = [...orders];
    if (activeTab === "Pending")
      list = list.filter(
        (o) => o.shipping_status === "pending" || o.order_status === "pending",
      );
    if (activeTab === "To Ship")
      list = list.filter((o) => o.shipping_status === "shipping");
    if (activeTab === "Shipped")
      list = list.filter((o) => o.shipping_status === "delivered");
    if (activeTab === "Cancelled")
      list = list.filter((o) => o.order_status === "cancelled");
    setFiltered(list);
    setPage(1);
  }, [activeTab, orders]);

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

  const fetchOrderDetail = async (orderId: number) => {
    try {
      const res = await fetch(`${API}/orders/${orderId}`);
      const json = await res.json();
      const d = json.data;
      setSelected({
        ...d.order,
        items: d.items ?? [],
      });
      setCarrier("");
      setTracking("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmTracking = async () => {
    if (!selected) return;
    if (!carrier || !tracking)
      return alert("กรุณากรอก Carrier และ Tracking Number");
    setSaving(true);
    try {
      await fetch(`${API}/orders/${selected.order_id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping_status: "delivered" }),
      });
      alert(
        `บันทึก Tracking สำเร็จ!\nCarrier: ${carrier}\nTracking: ${tracking}`,
      );
      fetchOrders();
      setSelected(null);
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  // pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <div style={styles.layout}>
        {/* ─── Sidebar ─── */}
        <ShopSidebar />

        {/* ─── Content ─── */}
        <div style={styles.content}>
          <div style={styles.pageTitle}>Orders</div>
          <div style={styles.pageSubtitle}>Manage and track your customer fulfilment.</div>

          <div style={styles.mainRow}>
            {/* ─── Left: Orders table ─── */}
            <div style={styles.tableSection}>
              {/* Tabs */}
              <div style={styles.tabs}>
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    style={{
                      ...styles.tab,
                      ...(activeTab === tab ? styles.tabActive : {}),
                    }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Table */}
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={styles.empty}>กำลังโหลด...</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={5} style={styles.empty}>ไม่มี Order</td></tr>
                  ) : (
                    paginated.map((o) => (
                      <tr
                        key={o.order_id}
                        style={{
                          ...styles.tableRow,
                          ...(selected?.order_id === o.order_id ? styles.tableRowSelected : {}),
                        }}
                        onClick={() => fetchOrderDetail(o.order_id)}
                      >
                        <td style={styles.td}>
                          <span style={styles.orderId}>#{`ORD-${o.order_id}`}</span>
                        </td>
                        <td style={styles.td}>{formatDate(o.order_date)}</td>
                        <td style={styles.td}>{o.customer_name}</td>
                        <td style={styles.td}>
                          <StatusBadge status={o.shipping_status ?? o.order_status} />
                        </td>
                        <td style={styles.td}>{o.total_amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div style={styles.pagination}>
                <span style={{ fontSize: 13, color: "#888" }}>
                  Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} orders
                </span>
                {page < totalPages && (
                  <button style={styles.nextBtn} onClick={() => setPage(p => p + 1)}>
                    Next →
                  </button>
                )}
              </div>
            </div>

            {/* ─── Right: Order Detail Panel ─── */}
            {selected && (
              <div style={styles.detailPanel}>
                {/* Header */}
                <div style={styles.detailHeader}>
                  <span style={styles.detailOrderId}>#{`ORD-${selected.order_id}`}</span>
                  <StatusBadge status={selected.shipping_status} />
                </div>
                <div style={styles.detailDate}>{formatDate(selected.order_date)}</div>

                {/* Fulfillment Details */}
                <div style={styles.fulfillmentBox}>
                  <div style={styles.fulfillmentTitle}>Fulfillment Details</div>
                  <div style={styles.fulfillmentSub}>
                    Enter tracking information to mark this order as shipped
                  </div>

                  <label style={styles.label}>Carrier</label>
                  <input
                    style={styles.input}
                    placeholder="FedEx"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                  />

                  <label style={{ ...styles.label, marginTop: 12 }}>Tracking Number</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. 1Z99W9999HV"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                  />

                  <button
                    style={styles.confirmBtn}
                    onClick={handleConfirmTracking}
                    disabled={saving}
                  >
                    {saving ? "กำลังบันทึก..." : "Confirm & Add Tracking"}
                  </button>
                </div>

                {/* Customer */}
                <div style={styles.sectionLabel}>Customer</div>
                <div style={styles.customerBox}>
                  <div style={styles.customerAvatar}>
                    {(selected.customer_name ?? "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={styles.customerName}>{selected.customer_name}</div>
                    <div style={styles.customerDetail}>{selected.address_phone}</div>
                    <div style={styles.customerDetail}>{selected.address_detail}</div>
                  </div>
                </div>

                {/* Items */}
                <div style={styles.sectionLabel}>Items ({selected.items.length})</div>
                {selected.items.map((item) => (
                  <div key={item.product_id} style={styles.itemRow}>
                    <div style={styles.itemImg}>
                      {item.image_url ? (
                        <img
                          src={`${API}${item.image_url}`}
                          alt={item.product_name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
                        />
                      ) : <span>📦</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.itemName}>{item.product_name}</div>
                      <div style={styles.itemSub}>Amount : {item.quantity}</div>
                    </div>
                    <div style={styles.itemPrice}>$ {Number(item.price_at_purchase).toFixed(2)}</div>
                  </div>
                ))}

                {/* Footer buttons */}
                <div style={styles.detailFooter}>
                  <button style={styles.cancelBtn} onClick={() => setSelected(null)}>Cancel</button>
                  <button style={styles.saveBtn} onClick={handleConfirmTracking} disabled={saving}>
                    Save
                  </button>
                </div>
              </div>
            )}
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
  sidebar: { width: 160, background: "#3d2b00", padding: "16px 0", flexShrink: 0 },
  sidebarItem: { padding: "14px 20px", color: "#ccc", fontSize: 14, cursor: "pointer" },
  sidebarActive: { background: "#5a4010", color: "#f5a623", fontWeight: 700 },

  content:     { flex: 1, padding: 24 },
  pageTitle:   { fontSize: 26, fontWeight: 800, marginBottom: 4 },
  pageSubtitle:{ fontSize: 13, color: "#888", marginBottom: 20 },

  mainRow: { display: "flex", gap: 20, alignItems: "flex-start" },

  tableSection: { flex: 1, background: "#fff", borderRadius: 8, overflow: "hidden" },
  tabs: { display: "flex", borderBottom: "1px solid #eee" },
  tab: {
    padding: "12px 20px", background: "none", border: "none",
    cursor: "pointer", fontSize: 14, color: "#888",
    borderBottom: "2px solid transparent",
  },
  tabActive: { color: "#333", borderBottom: "2px solid #333", fontWeight: 600 },

  table:     { width: "100%", borderCollapse: "collapse" as const },
  tableHead: { background: "#fafafa" },
  th: {
    padding: "12px 16px", textAlign: "left" as const,
    fontSize: 13, fontWeight: 600, color: "#555",
    borderBottom: "1px solid #eee",
  },
  tableRow: {
    borderBottom: "1px solid #f5f5f5", cursor: "pointer",
    transition: "background 0.1s",
  },
  tableRowSelected: { background: "#fffbf0" },
  td:    { padding: "14px 16px", fontSize: 13 },
  empty: { padding: 40, textAlign: "center" as const, color: "#888" },
  orderId: { fontWeight: 600, color: "#333" },

  pagination: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 16px", borderTop: "1px solid #eee",
  },
  nextBtn: {
    border: "none", background: "none",
    color: "#333", cursor: "pointer", fontSize: 13, fontWeight: 600,
  },

  // Detail panel
  detailPanel: {
    width: 280, flexShrink: 0, background: "#fff",
    borderRadius: 8, padding: 20,
    maxHeight: "80vh", overflowY: "auto" as const,
  },
  detailHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  detailOrderId: { fontWeight: 800, fontSize: 18 },
  detailDate:    { fontSize: 12, color: "#888", marginBottom: 16 },

  fulfillmentBox: {
    background: "#f8f9fa", borderRadius: 8,
    padding: 16, marginBottom: 20,
  },
  fulfillmentTitle: { fontWeight: 700, fontSize: 15, marginBottom: 4 },
  fulfillmentSub:   { fontSize: 12, color: "#888", marginBottom: 14 },

  label: { display: "block", fontSize: 13, color: "#555", marginBottom: 4 },
  input: {
    width: "100%", border: "1px solid #ddd", borderRadius: 6,
    padding: "8px 12px", fontSize: 13, outline: "none",
    boxSizing: "border-box" as const, marginBottom: 4,
  },
  confirmBtn: {
    width: "100%", background: "#f5a623", border: "none",
    padding: "10px", borderRadius: 6,
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    marginTop: 12,
  },

  sectionLabel: { fontWeight: 700, fontSize: 14, margin: "16px 0 10px" },

  customerBox:   { display: "flex", gap: 10, alignItems: "flex-start" },
  customerAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "#e2e8f0", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 13, flexShrink: 0,
  },
  customerName:   { fontWeight: 600, fontSize: 13 },
  customerDetail: { fontSize: 12, color: "#888", marginTop: 2 },

  itemRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  itemImg: {
    width: 48, height: 48, background: "#f0f0f0",
    borderRadius: 6, display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 20, flexShrink: 0, overflow: "hidden",
  },
  itemName:  { fontSize: 13, fontWeight: 500 },
  itemSub:   { fontSize: 12, color: "#888", marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: 600, marginLeft: "auto" },

  detailFooter: {
    display: "flex", gap: 10, marginTop: 20,
    paddingTop: 16, borderTop: "1px solid #eee",
  },
  cancelBtn: {
    flex: 1, border: "1px solid #ddd", background: "#fff",
    padding: "10px", borderRadius: 6, cursor: "pointer", fontSize: 14,
  },
  saveBtn: {
    flex: 1, background: "#f5a623", border: "none",
    padding: "10px", borderRadius: 6,
    fontWeight: 700, fontSize: 14, cursor: "pointer",
  },
};