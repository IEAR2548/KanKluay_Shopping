"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";

const API = "http://localhost:5000";
const SHOP_ID = 1; // TODO: replace with session shop id
const PAGE_SIZE = 10;

interface Product {
  product_id: number;
  product_name: string;
  description: string;
  price: number;
  category_name: string;
  shop_name: string;
  quantity: number;
}

function getStockStatus(qty: number): { label: string; color: string; bg: string } {
  if (qty === 0)  return { label: "Out of Stock", color: "#dc3545", bg: "#fdecea" };
  if (qty <= 5)   return { label: "Low Stock",    color: "#b8860b", bg: "#fff8e1" };
  return            { label: "In Stock",           color: "#28a745", bg: "#eafaf1" };
}

export default function ProductManagementPage() {
  const router = useRouter();
  const [products, setProducts]     = useState<Product[]>([]);
  const [filtered, setFiltered]     = useState<Product[]>([]);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState<number[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm]             = useState({ product_name: "", description: "", price: "", quantity: "" });

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    let list = [...products];
    if (search) {
      list = list.filter((p) =>
        p.product_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => {
        const s = getStockStatus(p.quantity).label.toLowerCase().replace(" ", "_");
        return s === statusFilter;
      });
    }
    setFiltered(list);
    setPage(1);
  }, [search, statusFilter, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/products/shop/${SHOP_ID}`);
      const json = await res.json();
      setProducts(json.data ?? json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบสินค้านี้?")) return;
    await fetch(`${API}/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const handleEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      product_name: p.product_name,
      description:  p.description,
      price:        String(p.price),
      quantity:     String(p.quantity),
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditProduct(null);
    setForm({ product_name: "", description: "", price: "", quantity: "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.product_name || !form.price) return alert("กรุณากรอกชื่อและราคา");
    if (editProduct) {
      await fetch(`${API}/products/${editProduct.product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: form.product_name,
          description:  form.description,
          price:        parseFloat(form.price),
        }),
      });
      // อัปเดต stock ถ้าเปลี่ยน quantity
      if (String(editProduct.quantity) !== form.quantity) {
        await fetch(`${API}/inventory/${editProduct.product_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: parseInt(form.quantity) }),
        });
      }
    } else {
      await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id:      SHOP_ID,
          local_cat_id: 1, // TODO: ให้ user เลือก category
          product_name: form.product_name,
          description:  form.description,
          price:        parseFloat(form.price),
          quantity:     parseInt(form.quantity) || 0,
        }),
      });
    }
    setShowModal(false);
    fetchProducts();
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? paginated.map((p) => p.product_id) : []);
  };

  // pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={styles.page}>
        <AdminNavbar />

      <div style={styles.layout}>
        {/* ─── Sidebar ─── */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarItem}>📊 Dashboard</div>
          <div style={{ ...styles.sidebarItem, ...styles.sidebarActive }}>📦 Products</div>
          <div style={styles.sidebarItem}>🧾 Orders</div>
        </div>

        {/* ─── Content ─── */}
        <div style={styles.content}>
          {/* header */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>Products</div>
              <div style={styles.pageSubtitle}>Manage and track your customer fulfilment.</div>
            </div>
            <button style={styles.addBtn} onClick={handleAddNew}>+ Add New Product</button>
          </div>

          {/* filters */}
          <div style={styles.filterBar}>
            <div style={styles.searchBox}>
              <input
                style={styles.searchInput}
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span style={styles.searchIcon}>🔍</span>
            </div>
            <select
              style={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Status All</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* table */}
          <div style={styles.tableCard}>
            {loading ? (
              <div style={styles.empty}>กำลังโหลด...</div>
            ) : paginated.length === 0 ? (
              <div style={styles.empty}>ไม่พบสินค้า</div>
            ) : (
              <>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHead}>
                      <th style={{ ...styles.th, width: 40 }}>
                        <input
                          type="checkbox"
                          onChange={(e) => toggleAll(e.target.checked)}
                          checked={selected.length === paginated.length && paginated.length > 0}
                        />
                      </th>
                      <th style={styles.th}>Product</th>
                      <th style={styles.th}>SKU</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>Stock</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p) => {
                      const stock = getStockStatus(p.quantity);
                      return (
                        <tr key={p.product_id} style={styles.tableRow}>
                          <td style={styles.td}>
                            <input
                              type="checkbox"
                              checked={selected.includes(p.product_id)}
                              onChange={() => toggleSelect(p.product_id)}
                            />
                          </td>
                          <td style={styles.td}>
                            <div style={styles.productCell}>
                              <div style={styles.productThumb}>📦</div>
                              <div>
                                <div style={styles.productName}>{p.product_name}</div>
                                <div style={styles.productCat}>{p.category_name}</div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.sku}>P-{String(p.product_id).padStart(3, "0")}</span>
                          </td>
                          <td style={styles.td}>฿{Number(p.price).toLocaleString()}</td>
                          <td style={styles.td}>{p.quantity}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              color: stock.color,
                              background: stock.bg,
                            }}>
                              ● {stock.label}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button style={styles.actionBtn} onClick={() => handleEdit(p)}>✏️</button>
                            <button style={styles.actionBtn} onClick={() => handleDelete(p.product_id)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* pagination */}
                <div style={styles.pagination}>
                  <span style={{ fontSize: 13, color: "#666" }}>
                    Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
                  </span>
                  <div style={styles.pageButtons}>
                    <button
                      style={styles.pageBtn}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >Previous</button>
                    <button
                      style={styles.pageBtn}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Modal Add/Edit ─── */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>
              {editProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
            </div>

            <label style={styles.label}>ชื่อสินค้า</label>
            <input
              style={styles.input}
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            />

            <label style={styles.label}>คำอธิบาย</label>
            <input
              style={styles.input}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label style={styles.label}>ราคา (฿)</label>
            <input
              style={styles.input}
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <label style={styles.label}>จำนวนสต็อก</label>
            <input
              style={styles.input}
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button style={styles.saveBtn} onClick={handleSave}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page:    { fontFamily: "Sarabun, sans-serif", background: "#f5f5f5", minHeight: "100vh" },
  topBar: {
    background: "#f5a623", padding: "10px 20px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  topBarLeft: { display: "flex", alignItems: "center", gap: 10 },
  logo:       { fontSize: 36 },
  logoText:   { fontWeight: 800, fontSize: 15, lineHeight: 1.1 },
  logoSub:    { fontSize: 11, color: "#7b4f00" },
  sellerMenu: {
    background: "#3d2b00", color: "#fff",
    padding: "6px 14px", borderRadius: 4, fontSize: 13, marginLeft: 8,
  },
  topBarRight: { display: "flex", alignItems: "center", gap: 16, fontSize: 14 },
  avatar: {
    width: 30, height: 30, borderRadius: "50%", background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
  },

  layout:  { display: "flex", minHeight: "calc(100vh - 56px)" },
  sidebar: { width: 120, background: "#3d2b00", padding: "16px 0", flexShrink: 0 },
  sidebarItem: {
    padding: "14px 20px", color: "#ccc",
    fontSize: 14, cursor: "pointer",
  },
  sidebarActive: { background: "#f5a623", color: "#fff", fontWeight: 700 },

  content:    { flex: 1, padding: 24 },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  pageTitle:  { fontSize: 24, fontWeight: 700 },
  pageSubtitle: { fontSize: 13, color: "#888", marginTop: 4 },
  addBtn: {
    background: "#f5a623", border: "none",
    padding: "10px 20px", borderRadius: 4,
    fontWeight: 700, fontSize: 14, cursor: "pointer",
  },

  filterBar:   { background: "#fff", padding: "12px 16px", borderRadius: 4, marginBottom: 8, display: "flex", gap: 10 },
  searchBox:   { flex: 1, position: "relative" },
  searchInput: {
    width: "100%", border: "1px solid #ddd", borderRadius: 4,
    padding: "8px 36px 8px 12px", fontSize: 14, outline: "none",
    boxSizing: "border-box" as const,
  },
  searchIcon:    { position: "absolute", right: 10, top: 8, fontSize: 16 },
  filterSelect: {
    border: "1px solid #ddd", borderRadius: 4,
    padding: "8px 12px", fontSize: 14, cursor: "pointer", outline: "none",
  },

  tableCard: { background: "#fff", borderRadius: 4, overflow: "hidden" },
  table:     { width: "100%", borderCollapse: "collapse" as const },
  tableHead: { background: "#fafafa" },
  th: {
    padding: "12px 16px", textAlign: "left" as const,
    fontSize: 14, fontWeight: 600, color: "#555",
    borderBottom: "1px solid #eee",
  },
  tableRow: { borderBottom: "1px solid #f5f5f5" },
  td:       { padding: "14px 16px", fontSize: 14, verticalAlign: "middle" as const },

  productCell:  { display: "flex", alignItems: "center", gap: 10 },
  productThumb: {
    width: 48, height: 48, background: "#e8f4fd",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, borderRadius: 4, flexShrink: 0,
  },
  productName: { fontWeight: 600, fontSize: 14 },
  productCat:  { fontSize: 12, color: "#888", marginTop: 2 },
  sku:         { fontSize: 12, color: "#888" },

  badge: {
    padding: "3px 10px", borderRadius: 20,
    fontSize: 12, fontWeight: 600,
  },
  actionBtn: {
    background: "none", border: "none",
    cursor: "pointer", fontSize: 16, marginRight: 4,
  },

  pagination: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 16px", borderTop: "1px solid #eee",
  },
  pageButtons: { display: "flex", gap: 8 },
  pageBtn: {
    border: "1px solid #ddd", background: "#fff",
    padding: "6px 14px", borderRadius: 4,
    cursor: "pointer", fontSize: 13,
  },

  empty: { padding: 40, textAlign: "center", color: "#888" },

  modalOverlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.4)", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  modal: {
    background: "#fff", borderRadius: 8,
    padding: 28, width: 420, display: "flex",
    flexDirection: "column" as const, gap: 8,
  },
  modalTitle:   { fontWeight: 700, fontSize: 18, marginBottom: 8 },
  label:        { fontSize: 13, fontWeight: 600, color: "#555" },
  input: {
    border: "1px solid #ddd", borderRadius: 4,
    padding: "8px 12px", fontSize: 14, outline: "none",
    width: "100%", boxSizing: "border-box" as const,
  },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  cancelBtn: {
    border: "1px solid #ddd", background: "#fff",
    padding: "8px 20px", borderRadius: 4, cursor: "pointer",
  },
  saveBtn: {
    background: "#f5a623", border: "none",
    padding: "8px 20px", borderRadius: 4,
    fontWeight: 700, cursor: "pointer",
  },
};