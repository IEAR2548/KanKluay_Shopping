"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";

const API = "http://localhost:5000";
const USER_ID = 2; // TODO: replace with session user id

interface CheckoutItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string | null;
}

interface Address {
  address_id: number;
  recipient_name: string;
  phone_number: string;
  address_detail: string;
  is_default: boolean;
}

const SHIPPING_FEE = 29;

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"promptpay" | "cash_on_delivery">("promptpay");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    // โหลด items จาก localStorage (ส่งมาจากหน้า Cart)
    const saved = localStorage.getItem("checkout_items");
    if (saved) setItems(JSON.parse(saved));

    // โหลด addresses ของ user
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      // ดึง address ผ่าน userRoutes: GET /users/:id/addresses
      const res = await fetch(`${API}/users/${USER_ID}/addresses`);
      const json = await res.json();
      const list: Address[] = json.data ?? [];
      setAddresses(list);
      setSelectedAddress(list.find((a) => a.is_default) ?? list[0] ?? null);
    } catch (err) {
      console.error("โหลด address ไม่ได้:", err);
    }
  };

  const combineTotal = items.reduce((sum, i) => sum + Number(i.subtotal), 0);
  const totalPayment = combineTotal + SHIPPING_FEE;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return alert("กรุณาเลือกที่อยู่จัดส่ง");
    setLoading(true);
    try {
      // ส่งเฉพาะสินค้าที่เลือกมา checkout
      const res = await fetch(`${API}/cart/${USER_ID}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address_id: selectedAddress.address_id,
          payment_method: paymentMethod,
          // ส่ง product_ids ที่เลือกมาด้วย เพื่อให้ backend ลบเฉพาะรายการนี้
          product_ids: items.map((i) => i.product_id),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      localStorage.removeItem("checkout_items");
      alert(`สั่งซื้อสำเร็จ! Order ID: ${json.data.order_id}`);
      router.push("/cart");
    } catch (err: any) {
      alert(err.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
     <AdminNavbar />

      {/* ─── Progress bar (decorative) ─── */}
      <div style={styles.progressBar}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.progressDot,
              background: i % 2 === 0 ? "#e53e3e" : "#3182ce",
            }}
          />
        ))}
      </div>

      <div style={styles.container}>
        {/* ─── Shipping Address ─── */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <span style={{ color: "#f5a623" }}>📍</span>
            <span style={{ color: "#f5a623", fontWeight: 700, marginLeft: 6 }}>
              Shipping Address
            </span>
          </div>
          {selectedAddress && (
            <div style={styles.addressRow}>
              <span style={{ fontWeight: 700, marginRight: 16 }}>
                {selectedAddress.recipient_name}
              </span>
              <span style={{ marginRight: 16 }}>{selectedAddress.phone_number}</span>
              <span style={{ color: "#555" }}>{selectedAddress.address_detail}</span>
            </div>
          )}
        </div>

        {/* ─── Order items ─── */}
        <div style={styles.card}>
          {/* column header */}
          <div style={styles.orderHeader}>
            <span style={{ flex: 1, fontWeight: 600 }}>I have placed an order.</span>
            <span style={styles.colHeader}>Price per unit</span>
            <span style={styles.colHeader}>Quantity</span>
            <span style={styles.colHeader}>Sub-items</span>
          </div>

          {/* group by shop — ใช้ shop_name จาก items ถ้ามี */}
          {items.length === 0 ? (
            <div style={{ padding: "24px", color: "#888", textAlign: "center" }}>
              ไม่มีสินค้า
            </div>
          ) : (
            <>
              <div style={styles.shopLabel}>ร้านโอโซนขายทุกอย่าง</div>
              {items.map((item) => (
                <div key={item.product_id} style={styles.itemRow}>
                  <div style={styles.productImg}>
                    {item.image_url ? (
                      <img
                        src={`http://localhost:5000${item.image_url}`}
                        alt={item.product_name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
                      />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.productName}>{item.product_name}</div>
                    <div style={styles.productVariant}>ตัวเลือกสินค้า:</div>
                  </div>
                  <span style={styles.colValue}>฿{item.price.toLocaleString()}</span>
                  <span style={styles.colValue}>{item.quantity}</span>
                  <span style={{ ...styles.colValue }}>
                    ฿{item.subtotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ─── Coupon ─── */}
        <div style={styles.couponBar}>
          <span style={{ color: "#e53e3e" }}>🎫</span>
          <span style={{ marginLeft: 8 }}>โค้ดส่วนลด KanGuay</span>
          <span style={{ marginLeft: "auto", color: "#3182ce", cursor: "pointer" }}>
            กดใช้โค้ด
          </span>
        </div>

        {/* ─── Payment method ─── */}
        <div style={styles.card}>
          <div style={styles.paymentRow}>
            <span style={{ fontWeight: 600, marginRight: 16 }}>Payment methods:</span>
            <button
              style={{
                ...styles.payBtn,
                ...(paymentMethod === "promptpay" ? styles.payBtnActive : {}),
              }}
              onClick={() => setPaymentMethod("promptpay")}
            >
              QR PromtPay
            </button>
            <button
              style={{
                ...styles.payBtn,
                ...(paymentMethod === "cash_on_delivery" ? styles.payBtnActive : {}),
              }}
              onClick={() => setPaymentMethod("cash_on_delivery")}
            >
              Cash on delivery
            </button>
          </div>

          {/* summary */}
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Combine orders</span>
              <span>฿{combineTotal.toLocaleString()}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span>฿{SHIPPING_FEE}</span>
            </div>
            <div style={{ ...styles.summaryRow, ...styles.summaryTotal }}>
              <span>Total payment</span>
              <span style={{ color: "#f5a623", fontWeight: 700, fontSize: 20 }}>
                ฿{totalPayment.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Terms + Place Order button ─── */}
        <div style={styles.termsBar}>
          <span style={{ fontSize: 12, color: "#555" }}>
            By clicking "Place Order," I have read and accept KanGuay's{" "}
            <a href="#" style={styles.link}>Terms of Service</a>,{" "}
            KanGuay's <a href="#" style={styles.link}>Refund/Return Policy</a>,{" "}
            and Shopee's <a href="#" style={styles.link}>Check Before Pay</a>,{" "}
            <a href="#" style={styles.link}>Immediate Return Policy</a>.
          </span>
          <button
            style={styles.placeBtn}
            onClick={handlePlaceOrder}
            disabled={loading || items.length === 0}
          >
            {loading ? "กำลังดำเนินการ..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { fontFamily: "Sarabun, sans-serif", background: "#f5f5f5", minHeight: "100vh" },
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
    background: "#fff", padding: "12px 24px",
    display: "flex", alignItems: "center",
    borderBottom: "1px solid #e2e8f0",
  },
  brand: { display: "flex", alignItems: "center", gap: 8 },
  logo: { fontSize: 32 },
  brandText: { fontSize: 13, lineHeight: 1.2, fontWeight: 700 },
  separator: { color: "#ccc", fontSize: 24, margin: "0 8px" },
  pageTitle: { fontSize: 22, fontWeight: 700 },
  progressBar: {
    display: "flex", gap: 4, padding: "8px 24px",
    background: "#fff", borderBottom: "1px solid #eee",
  },
  progressDot: { width: 24, height: 4, borderRadius: 2 },
  container: { maxWidth: 1000, margin: "24px auto", padding: "0 16px" },
  card: {
    background: "#fff", borderRadius: 4,
    marginBottom: 8, padding: "20px 24px",
  },
  sectionTitle: { display: "flex", alignItems: "center", marginBottom: 12 },
  addressRow: { display: "flex", alignItems: "flex-start", fontSize: 14 },
  orderHeader: {
    display: "flex", alignItems: "center",
    paddingBottom: 12, borderBottom: "1px solid #f0f0f0",
    marginBottom: 12,
  },
  colHeader: { width: 120, textAlign: "center" as const, color: "#888", fontSize: 14 },
  shopLabel: { fontWeight: 700, fontSize: 15, marginBottom: 12 },
  itemRow: {
    display: "flex", alignItems: "center", gap: 12,
    paddingBottom: 16,
  },
  productImg: {
    width: 80, height: 80, background: "#e8f4fd",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 32, borderRadius: 4, flexShrink: 0,
  },
  productName: { fontWeight: 600, fontSize: 14, marginBottom: 4 },
  productVariant: { fontSize: 12, color: "#888" },
  colValue: { width: 120, textAlign: "center" as const, fontSize: 14 },
  couponBar: {
    background: "#fff", padding: "14px 24px",
    display: "flex", alignItems: "center",
    borderRadius: 4, marginBottom: 8, fontSize: 14,
  },
  paymentRow: { display: "flex", alignItems: "center", marginBottom: 20 },
  payBtn: {
    border: "1px solid #ccc", background: "#fff",
    padding: "6px 16px", borderRadius: 4,
    cursor: "pointer", marginRight: 8, fontSize: 14,
  },
  payBtnActive: { borderColor: "#f5a623", background: "#fffbf0" },
  summary: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  summaryRow: {
    display: "flex", justifyContent: "space-between",
    width: 280, fontSize: 14,
  },
  summaryTotal: { paddingTop: 8, borderTop: "1px solid #eee" },
  termsBar: {
    background: "#fff", padding: "16px 24px",
    borderRadius: 4, display: "flex",
    alignItems: "center", justifyContent: "space-between", gap: 16,
  },
  link: { color: "#3182ce" },
  placeBtn: {
    background: "#f5a623", border: "none",
    padding: "12px 32px", borderRadius: 4,
    fontWeight: 700, fontSize: 15, cursor: "pointer",
    whiteSpace: "nowrap" as const, flexShrink: 0,
  },
};