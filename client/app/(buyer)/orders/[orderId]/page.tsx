"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const API = "http://localhost:5000";
const USER_ID = 2;

interface OrderDetail {
  order_id: number;
  order_status: string;
  shipping_status: string;
  order_date: string;
  payment_timestamp: string;
  total_amount: number;
  platform_fee: number;
  recipient_name: string;
  address_phone: string;
  address_detail: string;
  shop_name: string;
}

// ─── Step mapping จาก shipping_status ───────────────────────
const STEPS = [
  { key: "ordered",   label: "มีคำสั่งซื้อใหม่",              icon: "📋" },
  { key: "paid",      label: "รายการสั่งซื้อที่ชำระเงินแล้ว", icon: "💰" },
  { key: "shipping",  label: "คำสั่งซื้อที่ได้ทำการจัดส่งแล้ว", icon: "🚚" },
  { key: "delivered", label: "ที่ต้องได้รับ",                  icon: "📥" },
];

function getActiveStep(order: OrderDetail): number {
  if (order.shipping_status === "delivered") return 3;
  if (order.shipping_status === "shipping")  return 2;
  if (order.order_status === "pending")      return 1;
  return 0;
}

// mock tracking timeline
const TRACKING_EVENTS = [
  { time: "18-04-2026 18:26", title: "การจัดส่งสำเร็จ",            desc: "พัสดุถูกจัดส่งสำเร็จแล้ว",        done: true,  highlight: true },
  { time: "",                 title: "ดูหลักฐานการจัดส่งสินค้า",   desc: "",                                done: true,  link: true },
  { time: "18-04-2026 16:06", title: "อยู่ระหว่างการขนส่ง",        desc: "พัสดุอยู่ระหว่างการนำส่ง",       done: true,  highlight: false },
  { time: "18-04-2026 14:25", title: "พัสดุส่งมอบให้พนักงานขนส่ง", desc: "",                                done: false, highlight: false },
  { time: "18-04-2026 14:03", title: "พัสดุถึงสาขาปลายทาง: CHICACO-P", desc: "",                           done: false, highlight: false },
];

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`${API}/orders/${orderId}`)
      .then((r) => r.json())
      .then((json) => {
        const o = json.data?.order ?? json.data;
        setOrder(o);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div style={styles.loading}>กำลังโหลด...</div>;
  if (!order)  return <div style={styles.loading}>ไม่พบ Order นี้</div>;

  const activeStep = getActiveStep(order);
  const isDelivered = order.shipping_status === "delivered";
  const isShipping  = order.shipping_status === "shipping";

  const stepDates = [
    order.order_date,
    order.payment_timestamp,
    order.order_date, // shipping date — ใช้ order_date แทนถ้าไม่มี field จริง
    isDelivered ? order.payment_timestamp : "",
  ];

  return (
    <div style={styles.page}>
      {/* ─── Top bar ─── */}
      <div style={styles.topBar}>
        <span>Seller Centre</span>
        <div style={styles.topBarRight}>
          <span>Notification</span>
          <div style={styles.avatar}>S</div>
          <span style={{ fontWeight: 600 }}>Sun2549</span>
        </div>
      </div>

      {/* ─── Navbar ─── */}
      <div style={styles.navbar}>
        <div style={styles.brand}>
          <div style={styles.logo}>🍌</div>
          <div>
            <div style={styles.brandName}>คันกล้วย</div>
            <div style={styles.brandSub}>Shopping</div>
          </div>
        </div>
        <input style={styles.search} placeholder="Search for products and stores" />
        <button style={styles.searchBtn}>🔍</button>
        <div style={styles.cartIcon}>🛒<span style={styles.cartBadge}>15</span></div>
      </div>

      <div style={styles.layout}>
        {/* ─── Sidebar ─── */}
        <div style={styles.sidebar}>
          <div style={styles.profile}>
            <div style={styles.profileAvatar}>S</div>
            <div>
              <div style={styles.profileName}>Sun2549</div>
              <div style={styles.profileEdit}>✏️ Edit Personal Information</div>
            </div>
          </div>
          <div style={styles.menu}>
            <div style={styles.menuItem}>👤 My Account</div>
            <div style={{ ...styles.menuItem, ...styles.menuItemActive }}>📋 My Purchases</div>
            <div style={styles.menuItem}>🔔 Notification</div>
          </div>
        </div>

        {/* ─── Main content ─── */}
        <div style={styles.content}>
          {/* header bar */}
          <div style={styles.headerBar}>
            <button style={styles.backBtn} onClick={() => router.back()}>
              ‹ Back
            </button>
            <span style={styles.orderNumber}>
              Order number : {String(order.order_id).padStart(8, "0").toUpperCase()}
            </span>
            {isDelivered && (
              <span style={styles.deliveredText}>
                | Your order has been successfully delivered.
              </span>
            )}
          </div>

          {/* ─── Stepper ─── */}
          <div style={styles.stepperCard}>
            <div style={styles.stepper}>
              {STEPS.map((step, i) => {
                const done    = i <= activeStep;
                const current = i === activeStep;
                return (
                  <div key={step.key} style={styles.stepWrapper}>
                    {/* connector line (ยกเว้นอันแรก) */}
                    {i > 0 && (
                      <div style={{
                        ...styles.connector,
                        background: i <= activeStep ? "#28a745" : "#ddd",
                      }} />
                    )}
                    <div style={styles.stepCol}>
                      <div style={{
                        ...styles.stepCircle,
                        background: done ? (current ? "#28a745" : "#28a745") : "#fff",
                        border: `2px solid ${done ? "#28a745" : "#ddd"}`,
                        color: done ? "#fff" : "#aaa",
                      }}>
                        {step.icon}
                      </div>
                      <div style={styles.stepLabel}>{step.label}</div>
                      {stepDates[i] && (
                        <div style={styles.stepDate}>
                          {formatDate(stepDates[i])}
                        </div>
                      )}
                      {i === 1 && order.platform_fee && (
                        <div style={styles.stepDate}>(฿{order.platform_fee})</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* action buttons */}
            <div style={styles.actionArea}>
              <p style={styles.inspectNote}>
                กรุณาตรวจสอบสินค้าทุกชิ้น ในคำสั่งซื้อก่อนกดยืนยันการรับสินค้า
                หากพบปัญหา คุณสามารถถือคืนเงิน/คืนสินค้าได้ภายใน{" "}
                <span style={{ color: "#28a745", fontWeight: 600 }}>03-05-2026</span>
              </p>

              {isDelivered && (
                <button style={styles.acceptBtn}>
                  I have inspected and accepted the goods
                </button>
              )}

              {/* ปุ่ม Request refund แสดงเฉพาะตอน delivered เท่านั้น ไม่แสดงตอน shipping */}
              {isDelivered && (
                <button style={styles.refundBtn}>Request a refund/return</button>
              )}

              <button style={styles.contactBtn}>Contact the seller</button>
            </div>
          </div>

          {/* ─── Divider ─── */}
          <div style={styles.progressBar}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                ...styles.progressDot,
                background: i % 2 === 0 ? "#e53e3e" : "#3182ce",
              }} />
            ))}
          </div>

          {/* ─── Bottom: Address + Tracking ─── */}
          <div style={styles.bottomRow}>
            {/* Shipping Address */}
            <div style={styles.addressCard}>
              <div style={styles.addressTitle}>Shipping Address</div>
              <div style={styles.addressName}>{order.recipient_name ?? "สมชาย ใจดี"}</div>
              <div style={styles.addressPhone}>{order.address_phone ?? "0812345678"}</div>
              <div style={styles.addressDetail}>{order.address_detail ?? "123 ถนนสุขุมวิท กรุงเทพ"}</div>
            </div>

            {/* Tracking timeline */}
            <div style={styles.trackingCard}>
              <div style={styles.trackingHeader}>
                <span>KGX Express</span>
                <span style={{ color: "#888", fontSize: 13 }}>TH1234567899999990</span>
              </div>
              <div style={styles.timeline}>
                {TRACKING_EVENTS.map((ev, i) => (
                  <div key={i} style={styles.timelineRow}>
                    <div style={styles.timelineLeft}>
                      <div style={{
                        ...styles.timelineDot,
                        background: ev.done ? "#28a745" : "#ddd",
                        border: ev.done ? "none" : "2px solid #ccc",
                      }}>
                        {ev.done && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
                      </div>
                      {i < TRACKING_EVENTS.length - 1 && (
                        <div style={{
                          ...styles.timelineLine,
                          background: ev.done ? "#28a745" : "#ddd",
                        }} />
                      )}
                    </div>
                    <div style={styles.timelineRight}>
                      {ev.time && <div style={styles.timelineTime}>{ev.time}</div>}
                      <div style={{
                        ...styles.timelineTitle,
                        color: ev.highlight ? "#28a745" : ev.link ? "#3182ce" : "#333",
                        cursor: ev.link ? "pointer" : "default",
                      }}>
                        {ev.title}
                      </div>
                      {ev.desc && <div style={styles.timelineDesc}>{ev.desc}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────
function formatDate(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const dd   = String(d.getDate()).padStart(2, "0");
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh   = String(d.getHours()).padStart(2, "0");
    const min  = String(d.getMinutes()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  } catch {
    return iso;
  }
}

// ─── Styles ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page:    { fontFamily: "Sarabun, sans-serif", background: "#f5f5f5", minHeight: "100vh" },
  loading: { padding: 40, textAlign: "center" },

  topBar: {
    background: "#f5a623", color: "#000", fontSize: 13,
    padding: "6px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  topBarRight: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    width: 28, height: 28, borderRadius: "50%", background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
  },

  navbar: {
    background: "#f5a623", padding: "10px 24px",
    display: "flex", alignItems: "center", gap: 12,
  },
  brand:     { display: "flex", alignItems: "center", gap: 8, marginRight: 12 },
  logo:      { fontSize: 36 },
  brandName: { fontWeight: 800, fontSize: 16, lineHeight: 1.1 },
  brandSub:  { fontSize: 11, color: "#7b4f00" },
  search: {
    flex: 1, border: "none", borderRadius: 4,
    padding: "10px 16px", fontSize: 14, outline: "none",
  },
  searchBtn: {
    background: "#e69500", border: "none", borderRadius: 4,
    padding: "10px 16px", cursor: "pointer", fontSize: 16,
  },
  cartIcon:  { position: "relative", fontSize: 24, cursor: "pointer" },
  cartBadge: {
    position: "absolute", top: -6, right: -8,
    background: "#e53e3e", color: "#fff", borderRadius: "50%",
    fontSize: 10, width: 18, height: 18,
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
  },

  layout: {
    maxWidth: 1100, margin: "24px auto", padding: "0 16px",
    display: "flex", gap: 16, alignItems: "flex-start",
  },

  sidebar: { width: 200, background: "#fff", borderRadius: 4, padding: "20px 0", flexShrink: 0 },
  profile: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "0 16px 16px", borderBottom: "1px solid #f0f0f0",
  },
  profileAvatar: {
    width: 44, height: 44, borderRadius: "50%",
    background: "#555", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 700, flexShrink: 0,
  },
  profileName:   { fontWeight: 700, fontSize: 14 },
  profileEdit:   { fontSize: 11, color: "#888", cursor: "pointer", marginTop: 2 },
  menu:          { padding: "12px 0" },
  menuItem: {
    padding: "10px 20px", fontSize: 14,
    cursor: "pointer", color: "#333",
  },
  menuItemActive: { color: "#f5a623", fontWeight: 600 },

  content: { flex: 1 },

  headerBar: {
    background: "#fff", borderRadius: 4, padding: "14px 20px",
    display: "flex", alignItems: "center", gap: 8,
    marginBottom: 8, flexWrap: "wrap" as const,
  },
  backBtn: {
    background: "none", border: "none",
    fontSize: 16, cursor: "pointer", color: "#333", marginRight: 8,
  },
  orderNumber:   { fontWeight: 600, fontSize: 15 },
  deliveredText: { color: "#f5a623", fontWeight: 600, fontSize: 14 },

  stepperCard: {
    background: "#fff", borderRadius: 4,
    padding: "32px 24px 24px", marginBottom: 0,
  },
  stepper: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "center", position: "relative",
    marginBottom: 32,
  },
  stepWrapper: {
    display: "flex", alignItems: "flex-start",
    flex: 1, position: "relative",
  },
  connector: {
    position: "absolute", top: 28, left: "-50%",
    width: "100%", height: 3, zIndex: 0,
  },
  stepCol: {
    display: "flex", flexDirection: "column" as const,
    alignItems: "center", zIndex: 1, flex: 1,
  },
  stepCircle: {
    width: 56, height: 56, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  stepLabel: { fontSize: 13, textAlign: "center" as const, fontWeight: 500, maxWidth: 120 },
  stepDate:  { fontSize: 11, color: "#888", textAlign: "center" as const, marginTop: 4 },

  actionArea: {
    display: "flex", flexDirection: "column" as const,
    alignItems: "flex-end", gap: 10,
  },
  inspectNote: { fontSize: 13, color: "#555", textAlign: "right" as const, maxWidth: 600, margin: 0 },
  acceptBtn: {
    background: "#f5a623", border: "none",
    padding: "12px 24px", borderRadius: 4,
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    color: "#fff",
  },
  refundBtn: {
    border: "1px solid #ccc", background: "#fff",
    padding: "10px 24px", borderRadius: 4,
    fontSize: 14, cursor: "pointer", width: 220, textAlign: "center" as const,
  },
  contactBtn: {
    border: "1px solid #ccc", background: "#fff",
    padding: "10px 24px", borderRadius: 4,
    fontSize: 14, cursor: "pointer", width: 220, textAlign: "center" as const,
  },

  progressBar: {
    display: "flex", gap: 4, padding: "10px 0",
    justifyContent: "center",
  },
  progressDot: { width: 24, height: 4, borderRadius: 2 },

  bottomRow: {
    display: "flex", gap: 16, marginTop: 8,
    background: "#fff", borderRadius: 4, padding: "24px 20px",
  },
  addressCard: { width: 220, flexShrink: 0 },
  addressTitle:  { fontWeight: 700, fontSize: 16, marginBottom: 12 },
  addressName:   { fontWeight: 700, fontSize: 14, marginBottom: 4 },
  addressPhone:  { fontSize: 14, marginBottom: 6, color: "#555" },
  addressDetail: { fontSize: 13, color: "#555", lineHeight: 1.6 },

  trackingCard: { flex: 1 },
  trackingHeader: {
    display: "flex", justifyContent: "flex-end",
    gap: 12, marginBottom: 16, fontSize: 14,
  },
  timeline: { display: "flex", flexDirection: "column" as const, gap: 0 },
  timelineRow: { display: "flex", gap: 12 },
  timelineLeft: {
    display: "flex", flexDirection: "column" as const,
    alignItems: "center", width: 20, flexShrink: 0,
  },
  timelineDot: {
    width: 20, height: 20, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  timelineLine: { width: 2, flex: 1, minHeight: 24, marginTop: 2, marginBottom: 2 },
  timelineRight: { paddingBottom: 20, flex: 1 },
  timelineTime:  { fontSize: 12, color: "#888", marginBottom: 2 },
  timelineTitle: { fontSize: 13, fontWeight: 600 },
  timelineDesc:  { fontSize: 12, color: "#888", marginTop: 2 },
};