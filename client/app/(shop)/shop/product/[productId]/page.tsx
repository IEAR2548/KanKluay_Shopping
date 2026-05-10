"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";

const API = "http://localhost:5000";

export default function EditProductPage() {
  const router   = useRouter();
  const params   = useParams();
  const productId = params?.productId as string;

  const [form, setForm] = useState({
    product_name: "",
    description:  "",
    price:        "",
    quantity:     "",
  });
  const [loading, setSaving] = useState(false);

  // โหลดข้อมูลสินค้าเดิมมาแสดง
  useEffect(() => {
    if (!productId) return;
    fetch(`${API}/products/${productId}`)
      .then((r) => r.json())
      .then((json) => {
        const p = json.data ?? json;
        setForm({
          product_name: p.product_name ?? "",
          description:  p.description  ?? "",
          price:        String(p.price    ?? ""),
          quantity:     String(p.quantity ?? ""),
        });
      })
      .catch(() => alert("Failed to load product"));
  }, [productId]);

  const handleSave = async () => {
    if (!form.product_name || !form.price) return alert("กรุณากรอกชื่อและราคา");
    setSaving(true);
    try {
      // แก้ข้อมูลสินค้า
      const res = await fetch(`${API}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: form.product_name,
          description:  form.description,
          price:        parseFloat(form.price) || 0,
        }),
      });
      if (!res.ok) throw new Error("แก้ไขไม่สำเร็จ");

      // แก้ stock แยก
      await fetch(`${API}/inventory/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: parseInt(form.quantity) || 0 }),
      });

      router.push("/shop/product");
    } catch (err: any) {
      alert(err.message ?? "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <div style={styles.layout}>
        {/* ─── Sidebar ─── */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarItem} onClick={() => router.push("/seller/dashboard")}>
            📊 Dashboard
          </div>
          <div style={{ ...styles.sidebarItem, ...styles.sidebarActive }}>
            📦 Products
          </div>
          <div style={styles.sidebarItem} onClick={() => router.push("/seller/orders")}>
            🧾 Orders
          </div>
        </div>

        {/* ─── Content ─── */}
        <div style={styles.content}>
          {/* page header */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>Edit Product</div>
              <div style={styles.pageSubtitle}>
                Update the details of your product.
              </div>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.backBtn} onClick={() => router.back()}>Back</button>
              <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
                {loading ? "กำลังบันทึก..." : "Save"}
              </button>
            </div>
          </div>

          {/* ─── Two column layout ─── */}
          <div style={styles.twoCol}>
            {/* Left: Basic Information */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>Basic Information</div>
              <div style={styles.divider} />

              <label style={styles.label}>Product name</label>
              <input
                style={styles.input}
                placeholder="e.g. Lamp"
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              />

              <label style={{ ...styles.label, marginTop: 20 }}>Description</label>
              <textarea
                style={styles.textarea}
                placeholder="Describe the product features, materials, etc."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Right: Media + Pricing */}
            <div style={styles.rightCol}>
              {/* Media */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>Media</div>
                <div style={styles.divider} />
                <div style={styles.uploadBox}>
                  <div style={styles.uploadIcon}>📁</div>
                  <div style={styles.uploadText}>
                    Drag & Drop or{" "}
                    <span style={styles.uploadLink}>Choose file</span> to upload
                  </div>
                  <div style={styles.uploadHint}>fig, zip, pdf, png, jpeg</div>
                </div>
                <div style={styles.uploadCaption}>
                  Fill in your image details of your product.
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>Pricing & Inventory</div>
                <div style={styles.divider} />

                <label style={styles.label}>Price</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputPrefix}>฿</span>
                  <input
                    style={styles.inputWithPrefix}
                    type="number"
                    placeholder="0.0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>

                <label style={{ ...styles.label, marginTop: 20 }}>Number of stock</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles (เหมือน add page ทุกอย่าง) ──────────────────────
const styles: Record<string, React.CSSProperties> = {
  page:    { fontFamily: "Sarabun, sans-serif", background: "#f5f5f5", minHeight: "100vh" },
  layout:  { display: "flex", minHeight: "calc(100vh - 56px)" },
  sidebar: { width: 160, background: "#3d2b00", padding: "16px 0", flexShrink: 0 },
  sidebarItem: { padding: "14px 20px", color: "#ccc", fontSize: 14, cursor: "pointer" },
  sidebarActive: { background: "#5a4010", color: "#f5a623", fontWeight: 700 },
  content:    { flex: 1, padding: 28 },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  pageTitle:    { fontSize: 26, fontWeight: 800 },
  pageSubtitle: { fontSize: 13, color: "#888", marginTop: 4 },
  headerActions: { display: "flex", gap: 12 },
  backBtn: {
    border: "1px solid #ccc", background: "#fff",
    padding: "10px 28px", borderRadius: 6,
    fontSize: 15, cursor: "pointer", fontWeight: 600,
  },
  saveBtn: {
    background: "#f5a623", border: "none",
    padding: "10px 36px", borderRadius: 6,
    fontSize: 15, fontWeight: 700, cursor: "pointer",
  },
  twoCol:   { display: "flex", gap: 20, alignItems: "flex-start" },
  card:     { background: "#fff", borderRadius: 8, padding: "24px", flex: 1 },
  rightCol: { width: 380, flexShrink: 0, display: "flex", flexDirection: "column" as const, gap: 20 },
  cardTitle: { fontSize: 20, fontWeight: 700, marginBottom: 12 },
  divider:   { height: 1, background: "#eee", marginBottom: 20 },
  label: { display: "block", fontSize: 14, color: "#555", marginBottom: 6 },
  input: {
    width: "100%", border: "none", borderRadius: 6,
    padding: "12px 14px", fontSize: 14, outline: "none",
    background: "#e8f0f7", boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%", border: "none", borderRadius: 6,
    padding: "12px 14px", fontSize: 14, outline: "none",
    background: "#e8f0f7", boxSizing: "border-box" as const,
    minHeight: 200, resize: "vertical" as const,
    fontFamily: "Sarabun, sans-serif",
  },
  inputWrapper: { display: "flex", alignItems: "center", background: "#e8f0f7", borderRadius: 6, overflow: "hidden" },
  inputPrefix: { padding: "12px 12px", fontSize: 14, color: "#888", background: "#e8f0f7" },
  inputWithPrefix: { flex: 1, border: "none", background: "#e8f0f7", padding: "12px 14px 12px 0", fontSize: 14, outline: "none" },
  uploadBox: {
    border: "2px dashed #c8d8e8", borderRadius: 8,
    padding: "40px 20px", textAlign: "center" as const,
    background: "#f0f6fb", cursor: "pointer", marginBottom: 10,
  },
  uploadIcon:    { fontSize: 28, marginBottom: 8 },
  uploadText:    { fontSize: 14, color: "#555" },
  uploadLink:    { color: "#3182ce", cursor: "pointer" },
  uploadHint:    { fontSize: 12, color: "#aaa", marginTop: 4 },
  uploadCaption: { fontSize: 12, color: "#888" },
};