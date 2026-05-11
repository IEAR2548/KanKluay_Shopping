"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";

// ─── Types ───────────────────────────────────────────────────
interface CartItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock_available: number;
  image_url: string | null;
  shop_id: number;
  shop_name: string;
}

interface CartData {
  cart_id: number;
  items: CartItem[];
  total_amount: number;
}

interface GroupedShop {
  shop_id: number;
  shop_name: string;
  items: (CartItem & { checked: boolean })[];
}

const API = "http://localhost:5000";
const USER_ID = 2; // TODO: replace with session user id

// ─── Component ───────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupedShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);

  // fetch cart
  const fetchCart = async () => {
    try {
      const res = await fetch(`${API}/cart/${USER_ID}`);
      const json = await res.json();
      const data: CartData = json.data;

      // group by shop — ดึง shop_name จาก product (เพิ่ม shop_id ใน GET cart ถ้าต้องการ)
      // สำหรับตอนนี้ใช้ข้อมูลจาก API ที่มี
      const shopMap: Record<number, GroupedShop> = {};
      for (const item of data.items) {
        const shopId = item.shop_id ?? 0;
        const shopName = item.shop_name ?? "ร้านค้า";
        if (!shopMap[shopId]) {
          shopMap[shopId] = { shop_id: shopId, shop_name: shopName, items: [] };
        }
        shopMap[shopId].items.push({ ...item, checked: false });
      }
      setGroups(Object.values(shopMap));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  // toggle check ทีละชิ้น
  const toggleItem = (shopId: number, productId: number) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.shop_id === shopId
          ? {
              ...g,
              items: g.items.map((i) =>
                i.product_id === productId ? { ...i, checked: !i.checked } : i
              ),
            }
          : g
      )
    );
  };

  // toggle check ทั้งร้าน
  const toggleShop = (shopId: number, checked: boolean) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.shop_id === shopId
          ? { ...g, items: g.items.map((i) => ({ ...i, checked })) }
          : g
      )
    );
  };

  // toggle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setGroups((prev) =>
      prev.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, checked })) }))
    );
  };

  // เปลี่ยน quantity
  const changeQty = async (productId: number, newQty: number) => {
    if (newQty < 1) return;
    await fetch(`${API}/cart/${USER_ID}/items/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });
    fetchCart();
  };

  // ลบสินค้า
  const removeItem = async (productId: number) => {
    await fetch(`${API}/cart/${USER_ID}/items/${productId}`, { method: "DELETE" });
    fetchCart();
  };

  // คำนวณ
  const checkedItems = groups.flatMap((g) => g.items.filter((i) => i.checked));
  const totalItems = checkedItems.length;
  const totalPrice = checkedItems.reduce((sum, i) => sum + Number(i.subtotal), 0);

  // ไปหน้า checkout
  const handleOrderProducts = () => {
    const selected = checkedItems.map((i) => ({
      product_id: i.product_id,
      product_name: i.product_name,
      price: i.price,
      quantity: i.quantity,
      subtotal: i.subtotal,
      image_url: i.image_url ?? null,
    }));
    localStorage.setItem("checkout_items", JSON.stringify(selected));
    router.push("/checkout");
  };

  if (loading) return <div style={styles.loading}>กำลังโหลด...</div>;

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <div style={styles.container}>
        {/* ─── Column header ─── */}
        <div style={styles.tableHeader}>
          <span style={{ width: 32 }} />
          <span style={{ flex: 1 }}>Product</span>
          <span style={styles.col}>Price per unit</span>
          <span style={styles.col}>Quantity</span>
          <span style={styles.col}>Total price</span>
          <span style={styles.col}>Action</span>
        </div>

        {/* ─── Groups ─── */}
        {groups.length === 0 ? (
          <div style={styles.empty}>ไม่มีสินค้าใน Cart</div>
        ) : (
          groups.map((group) => (
            <div key={group.shop_id} style={styles.shopBlock}>
              {/* shop header */}
              <div style={styles.shopHeader}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={group.items.every((i) => i.checked)}
                  onChange={(e) => toggleShop(group.shop_id, e.target.checked)}
                />
                <span style={styles.shopName}>{group.shop_name}</span>
              </div>

              {/* items */}
              {group.items.map((item) => (
                <div key={item.product_id} style={styles.itemRow}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={item.checked}
                    onChange={() => toggleItem(group.shop_id, item.product_id)}
                  />
                  {/* product info */}
                  <div style={styles.productInfo}>
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
                    <div>
                      <div style={styles.productName}>{item.product_name}</div>
                      <div style={styles.productVariant}>ตัวเลือกสินค้า: ▾</div>
                    </div>
                  </div>
                  {/* price */}
                  <span style={styles.col}>฿{item.price.toLocaleString()}</span>
                  {/* qty */}
                  <div style={{ ...styles.col, ...styles.qtyControl }}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => changeQty(item.product_id, item.quantity - 1)}
                    >-</button>
                    <span style={styles.qtyNum}>{item.quantity}</span>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => changeQty(item.product_id, item.quantity + 1)}
                    >+</button>
                  </div>
                  {/* subtotal */}
                  <span style={{ ...styles.col, color: "#f5a623", fontWeight: 600 }}>
                    ฿{item.subtotal.toLocaleString()}
                  </span>
                  {/* delete */}
                  <div style={styles.col}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => removeItem(item.product_id)}
                    >ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

        {/* ─── Coupon ─── */}
        <div style={styles.couponBar}>
          <span style={{ color: "#e53e3e" }}>🎫</span>
          <span style={{ marginLeft: 8 }}>โค้ดส่วนลด KanGuay</span>
          <span style={{ marginLeft: "auto", color: "#3182ce", cursor: "pointer" }}>
            กดใช้โค้ด
          </span>
        </div>

        {/* ─── Footer bar ─── */}
        <div style={styles.footerBar}>
          <input
            type="checkbox"
            style={styles.checkbox}
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span style={{ marginLeft: 8 }}>Select All</span>
          <button style={styles.deleteBtnGhost}>ลบ</button>
          <div style={styles.footerRight}>
            <span>Total({totalItems} Items):</span>
            <span style={styles.totalPrice}>฿{totalPrice.toLocaleString()}</span>
            <button
              style={styles.orderBtn}
              onClick={handleOrderProducts}
              disabled={totalItems === 0}
            >
              Order Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { fontFamily: "Sarabun, sans-serif", background: "#f5f5f5", minHeight: "100vh" },
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
    background: "#fff", padding: "12px 24px",
    display: "flex", alignItems: "center", gap: 12,
    borderBottom: "1px solid #e2e8f0",
  },
  brand: { display: "flex", alignItems: "center", gap: 8 },
  logo: { fontSize: 32 },
  brandText: { fontSize: 13, lineHeight: 1.2, fontWeight: 700 },
  separator: { color: "#ccc", fontSize: 24, margin: "0 8px" },
  pageTitle: { fontSize: 22, fontWeight: 700 },
  search: {
    flex: 1, border: "1.5px solid #f5a623", borderRadius: 4,
    padding: "8px 14px", fontSize: 14, outline: "none",
  },
  searchBtn: {
    background: "#f5a623", border: "none", borderRadius: 4,
    padding: "8px 14px", cursor: "pointer", fontSize: 16,
  },
  container: { maxWidth: 1100, margin: "24px auto", padding: "0 16px" },
  tableHeader: {
    background: "#fff", padding: "14px 20px",
    display: "flex", alignItems: "center", gap: 12,
    borderRadius: 4, marginBottom: 8,
    color: "#555", fontSize: 14,
  },
  col: { width: 130, textAlign: "center" as const },
  shopBlock: {
    background: "#fff", borderRadius: 4,
    marginBottom: 8, overflow: "hidden",
  },
  shopHeader: {
    padding: "14px 20px", display: "flex", alignItems: "center",
    gap: 12, borderBottom: "1px solid #f0f0f0",
  },
  shopName: { fontWeight: 700, fontSize: 16 },
  itemRow: {
    padding: "16px 20px", display: "flex",
    alignItems: "center", gap: 12,
    borderBottom: "1px solid #fafafa",
  },
  checkbox: { width: 16, height: 16, accentColor: "#f5a623", cursor: "pointer" },
  productInfo: { flex: 1, display: "flex", alignItems: "center", gap: 12 },
  productImg: {
    width: 80, height: 80, background: "#e8f4fd",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 32, borderRadius: 4, flexShrink: 0,
  },
  productName: { fontWeight: 600, fontSize: 14, marginBottom: 4 },
  productVariant: { fontSize: 12, color: "#888" },
  qtyControl: { display: "flex", alignItems: "center", gap: 0 },
  qtyBtn: {
    width: 28, height: 28, border: "1px solid #ddd",
    background: "#fff", cursor: "pointer", fontSize: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  qtyNum: {
    width: 40, height: 28, border: "1px solid #ddd",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14,
  },
  deleteBtn: {
    border: "1px solid #ccc", background: "#fff",
    padding: "4px 14px", cursor: "pointer", borderRadius: 4,
  },
  empty: { background: "#fff", padding: 40, textAlign: "center", color: "#888" },
  couponBar: {
    background: "#fff", padding: "14px 20px",
    display: "flex", alignItems: "center",
    borderRadius: 4, marginTop: 8, fontSize: 14,
  },
  footerBar: {
    background: "#fff", padding: "14px 20px",
    display: "flex", alignItems: "center",
    borderRadius: 4, marginTop: 4, position: "sticky", bottom: 0,
    boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
  },
  footerRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 },
  totalPrice: { color: "#f5a623", fontWeight: 700, fontSize: 18 },
  deleteBtnGhost: {
    border: "none", background: "none",
    marginLeft: 16, cursor: "pointer", fontSize: 14,
  },
  orderBtn: {
    background: "#f5a623", border: "none",
    padding: "10px 28px", borderRadius: 4,
    fontWeight: 700, fontSize: 15, cursor: "pointer",
    opacity: 1,
  },
};