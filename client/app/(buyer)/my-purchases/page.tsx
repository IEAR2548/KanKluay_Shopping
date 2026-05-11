"use client";

import { useState, useEffect, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import UserNavbar from "@/components/layout/UserNavbar";
import ProfileSidebar from "@/components/layout/ProfileSidebar";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  image_url?: string | null;
}

interface Order {
  order_id: number;
  shop_id: number;
  shop_name: string;
  order_date: string;
  total_amount: number;
  order_status: string;
  shipping_status: string;
  items?: OrderItem[];
}

const STATUS_COLOR: Record<string, string> = {
  completed: "#28a745",
  pending:   "#f5a623",
  cancelled: "#dc3545",
};

const SHIPPING_COLOR: Record<string, string> = {
  shipping:  "#f5a623",
  delivered: "#28a745",
  returned:  "#dc3545",
};

export default function MyPurchasePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!userLoading && !user) {
      setLoading(false);
    }
    if (user) fetchOrders();
  }, [user, userLoading]);

  const fetchOrders = async () => {
    if (!user?.user_id) return;
    try {
      const res = await fetch(`${API}/orders/user/${user.user_id}`);
      const json = await res.json();
      const list: Order[] = json.data?.rows ?? json.data ?? [];
      setOrders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <UserNavbar />

      {/* ─── Main layout ─── */}
      <div style={styles.layout}>
        {/* ─── Sidebar ─── */}
        <ProfileSidebar 
          username={user?.username || user?.firstname || 'User'} 
          imageUrl={user?.image_url} 
        />

        {/* ─── Content ─── */}
        <div style={styles.content}>
          {loading ? (
            <div style={styles.empty}>กำลังโหลด...</div>
          ) : orders.length === 0 ? (
            <div style={styles.empty}>ไม่มีรายการสั่งซื้อ</div>
          ) : (
            orders.map((order) => (
              <OrderCard key={order.order_id} order={order} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Order Card ──────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API}/orders/${order.order_id}`) // ใช้ตัวแปร API ที่ประกาศไว้ด้านบน
      .then((r) => r.json())
      .then((json) => {
        setItems(json.data?.items ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [order.order_id]);

  const statusStr = order.order_status || "pending";
  const statusLabel = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
  const statusColor = STATUS_COLOR[statusStr] ?? "#888";
  
  const shipStr = order.shipping_status || "shipping";
  const shippingColor = SHIPPING_COLOR[shipStr] ?? "#888";
  const shippingLabel = shipStr.charAt(0).toUpperCase() + shipStr.slice(1);

  return (
    <div style={styles.orderCard}>
      <div style={styles.orderHeader}>
        <span style={styles.shopName}>{order.shop_name ?? `Shop #${order.shop_id}`}</span>
        <button style={styles.chatBtn}>💬 Chat</button>
        <button style={styles.viewStoreBtn}>🏪 View Store</button>
        <span style={{ marginLeft: "auto", color: statusColor, fontWeight: 600 }}>
          ● {statusLabel}
        </span>
      </div>

      {!loaded ? (
        <div style={styles.itemRow}>
          <div style={{ color: "#aaa", fontSize: 13 }}>กำลังโหลดรายการ...</div>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.product_id} style={styles.itemRow}>
            {/* แก้ไขตรงนี้: ส่วนแสดงรูปภาพสินค้า */}
            <div style={styles.itemImg}>
              {item.image_url ? (
                <img
                  src={item.image_url.startsWith('http') || item.image_url.startsWith('data:') ? item.image_url : `${API}${item.image_url}`}
                  alt={item.product_name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
                />
              ) : (
                <span>📦</span>
              )}
            </div>
            
            <div style={styles.itemInfo}>
              <div style={styles.itemName}>
                {item.product_name}
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>x{item.quantity}</div>
            </div>
            <div style={styles.itemPrice}>
              ฿{Number(item.price_at_purchase).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))
      )}

      <div style={styles.divider} />

      <div style={styles.orderFooter}>
        <div style={styles.statusTag}>
          Shipping Status:{" "}
          <span style={{ color: shippingColor, fontWeight: 600 }}>
            ● {shippingLabel}
          </span>
        </div>
        <div style={styles.footerActions}>
          <button style={styles.contactBtn}>💬 Contact Seller</button>
          <button style={styles.viewOrderBtn} onClick={() => router.push(`/orders/${order.order_id}`)}>🛒 View Order</button>
          <span style={styles.totalText}>
            Total: ฿{Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  page: { fontFamily: "Sarabun, sans-serif", background: "#f5f5f5", minHeight: "100vh" },
  layout: {
    maxWidth: 1100, margin: "24px auto", padding: "0 16px",
    display: "flex", gap: 16, alignItems: "flex-start",
  },
  content: { flex: 1 },
  empty: { background: "#fff", padding: 40, textAlign: "center", color: "#888", borderRadius: 4 },
  orderCard: {
    background: "#fff", borderRadius: 4,
    marginBottom: 12, overflow: "hidden",
  },
  orderHeader: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "14px 20px", borderBottom: "1px solid #f5f5f5",
  },
  shopName: { fontWeight: 700, fontSize: 16, marginRight: 4 },
  chatBtn: {
    border: "1px solid #ddd", background: "#fff",
    padding: "5px 12px", borderRadius: 4,
    cursor: "pointer", fontSize: 13,
  },
  viewStoreBtn: {
    border: "1px solid #ddd", background: "#fff",
    padding: "5px 12px", borderRadius: 4,
    cursor: "pointer", fontSize: 13,
  },
  itemRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "16px 20px", borderBottom: "1px solid #fafafa",
  },
  itemImg: {
    width: 60, height: 60, background: "#e8f4fd",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 28, borderRadius: 4, flexShrink: 0,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: 500 },
  itemPrice: { fontSize: 14, color: "#333", minWidth: 80, textAlign: "right" as const },
  divider: { height: 1, background: "#f0f0f0" },
  orderFooter: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px",
  },
  statusTag: { fontSize: 14 },
  footerActions: { display: "flex", alignItems: "center", gap: 10 },
  contactBtn: {
    border: "1px solid #ddd", background: "#fff",
    padding: "6px 14px", borderRadius: 20,
    cursor: "pointer", fontSize: 13,
  },
  viewOrderBtn: {
    border: "1px solid #ddd", background: "#fff",
    padding: "6px 14px", borderRadius: 20,
    cursor: "pointer", fontSize: 13,
  },
  totalText: { fontWeight: 700, fontSize: 16, marginLeft: 8 },
};