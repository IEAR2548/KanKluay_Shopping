// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useParams } from "next/navigation";
// import AdminNavbar from "@/components/admin/AdminNavbar";

// const API     = "http://localhost:5000";
// const SHOP_ID = 1; // TODO: replace with session shop id

// // ─── ใช้ได้ทั้ง Add และ Edit โดยส่ง mode มา ───────────────
// // Add: /shop/product/add        → mode="add"
// // Edit: /shop/product/[id]      → mode="edit"

// export function AddProductPage() {
//   return <ProductFormPage mode="add" />;
// }

// export function EditProductPage() {
//   return <ProductFormPage mode="edit" />;
// }

// // ─── Main Form Component ──────────────────────────────────
// function ProductFormPage({ mode }: { mode: "add" | "edit" }) {
//   const router    = useRouter();
//   const params    = useParams();
//   const productId = params?.productId as string | undefined;
//   const fileRef   = useRef<HTMLInputElement>(null);

//   const [form, setForm] = useState({
//     product_name: "",
//     description:  "",
//     price:        "",
//     quantity:     "",
//     image_url:    "",
//   });
//   const [preview,  setPreview]  = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [saving,   setSaving]   = useState(false);

//   // โหลดข้อมูลเดิมตอน Edit
//   useEffect(() => {
//     if (mode !== "edit" || !productId) return;
//     fetch(`${API}/products/${productId}`)
//       .then((r) => r.json())
//       .then((json) => {
//         const p = json.data ?? json;
//         setForm({
//           product_name: p.product_name ?? "",
//           description:  p.description  ?? "",
//           price:        String(p.price    ?? ""),
//           quantity:     String(p.quantity ?? ""),
//           image_url:    p.image_url     ?? "",
//         });
//         if (p.image_url) setPreview(`${API}${p.image_url}`);
//       })
//       .catch(() => alert("Failed to load product"));
//   }, [mode, productId]);

//   // อัปโหลดรูป → เอา URL กลับมาเก็บใน form.image_url
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // preview ทันที
//     setPreview(URL.createObjectURL(file));

//     // อัปโหลดไป backend
//     setUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const res  = await fetch(`${API}/upload`, { method: "POST", body: formData });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.error ?? "อัปโหลดไม่สำเร็จ");

//       setForm((prev) => ({ ...prev, image_url: json.data.url }));
//     } catch (err: any) {
//       alert(err.message);
//       setPreview(null);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSave = async () => {
//     if (!form.product_name || !form.price) return alert("กรุณากรอกชื่อและราคา");
//     setSaving(true);
//     try {
//       if (mode === "edit" && productId) {
//         // PUT product
//         await fetch(`${API}/products/${productId}`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             product_name: form.product_name,
//             description:  form.description,
//             price:        parseFloat(form.price) || 0,
//             image_url:    form.image_url || null,
//           }),
//         });
//         // PUT inventory
//         await fetch(`${API}/inventory/${productId}`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ quantity: parseInt(form.quantity) || 0 }),
//         });
//       } else {
//         // POST product
//         await fetch(`${API}/products`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             shop_id:      SHOP_ID,
//             local_cat_id: 1,
//             product_name: form.product_name,
//             description:  form.description,
//             price:        parseFloat(form.price) || 0,
//             quantity:     parseInt(form.quantity) || 0,
//             image_url:    form.image_url || null,
//           }),
//         });
//       }
//       router.push("/shop/product");
//     } catch (err: any) {
//       alert(err.message ?? "เกิดข้อผิดพลาด");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div style={styles.page}>
//       <AdminNavbar />

//       <div style={styles.layout}>
//         {/* ─── Sidebar ─── */}
//         <div style={styles.sidebar}>
//           <div style={styles.sidebarItem}>📊 Dashboard</div>
//           <div style={{ ...styles.sidebarItem, ...styles.sidebarActive }}>📦 Products</div>
//           <div style={styles.sidebarItem}>🧾 Orders</div>
//         </div>

//         {/* ─── Content ─── */}
//         <div style={styles.content}>
//           {/* header */}
//           <div style={styles.pageHeader}>
//             <div>
//               <div style={styles.pageTitle}>
//                 {mode === "edit" ? "Edit Product" : "Add new Product"}
//               </div>
//               <div style={styles.pageSubtitle}>
//                 {mode === "edit"
//                   ? "Update the details of your product."
//                   : "Fill in details below to list a new item in you store."}
//               </div>
//             </div>
//             <div style={styles.headerActions}>
//               <button style={styles.backBtn} onClick={() => router.back()}>Back</button>
//               <button style={styles.saveBtn} onClick={handleSave} disabled={saving || uploading}>
//                 {saving ? "กำลังบันทึก..." : "Save"}
//               </button>
//             </div>
//           </div>

//           {/* ─── Two column layout ─── */}
//           <div style={styles.twoCol}>
//             {/* Left: Basic Information */}
//             <div style={styles.card}>
//               <div style={styles.cardTitle}>Basic Information</div>
//               <div style={styles.divider} />

//               <label style={styles.label}>Product name</label>
//               <input
//                 style={styles.input}
//                 placeholder="e.g. Lamp"
//                 value={form.product_name}
//                 onChange={(e) => setForm({ ...form, product_name: e.target.value })}
//               />

//               <label style={{ ...styles.label, marginTop: 20 }}>Description</label>
//               <textarea
//                 style={styles.textarea}
//                 placeholder="Describe the product features, materials, etc."
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//               />
//             </div>

//             {/* Right: Media + Pricing */}
//             <div style={styles.rightCol}>
//               {/* Media */}
//               <div style={styles.card}>
//                 <div style={styles.cardTitle}>Media</div>
//                 <div style={styles.divider} />

//                 {/* hidden file input */}
//                 <input
//                   ref={fileRef}
//                   type="file"
//                   accept="image/*"
//                   style={{ display: "none" }}
//                   onChange={handleFileChange}
//                 />

//                 {/* upload box */}
//                 <div
//                   style={styles.uploadBox}
//                   onClick={() => fileRef.current?.click()}
//                 >
//                   {preview ? (
//                     <img
//                       src={preview}
//                       alt="preview"
//                       style={styles.previewImg}
//                     />
//                   ) : (
//                     <>
//                       <div style={styles.uploadIcon}>📁</div>
//                       <div style={styles.uploadText}>
//                         Drag & Drop or{" "}
//                         <span style={styles.uploadLink}>Choose file</span> to upload
//                       </div>
//                       <div style={styles.uploadHint}>fig, zip, pdf, png, jpeg</div>
//                     </>
//                   )}
//                   {uploading && (
//                     <div style={styles.uploadingOverlay}>กำลังอัปโหลด...</div>
//                   )}
//                 </div>

//                 {preview && (
//                   <button
//                     style={styles.removeImgBtn}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setPreview(null);
//                       setForm((prev) => ({ ...prev, image_url: "" }));
//                       if (fileRef.current) fileRef.current.value = "";
//                     }}
//                   >
//                     ✕ ลบรูป
//                   </button>
//                 )}

//                 <div style={styles.uploadCaption}>
//                   Fill in your image details of your product.
//                 </div>
//               </div>

//               {/* Pricing & Inventory */}
//               <div style={styles.card}>
//                 <div style={styles.cardTitle}>Pricing & Inventory</div>
//                 <div style={styles.divider} />

//                 <label style={styles.label}>Price</label>
//                 <div style={styles.inputWrapper}>
//                   <span style={styles.inputPrefix}>฿</span>
//                   <input
//                     style={styles.inputWithPrefix}
//                     type="number"
//                     placeholder="0.0"
//                     value={form.price}
//                     onChange={(e) => setForm({ ...form, price: e.target.value })}
//                   />
//                 </div>

//                 <label style={{ ...styles.label, marginTop: 20 }}>Number of stock</label>
//                 <input
//                   style={styles.input}
//                   type="number"
//                   placeholder="0"
//                   value={form.quantity}
//                   onChange={(e) => setForm({ ...form, quantity: e.target.value })}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Styles ──────────────────────────────────────────────────
// const styles: Record<string, React.CSSProperties> = {
//   page:    { fontFamily: "Sarabun, sans-serif", background: "#f5f5f5", minHeight: "100vh" },
//   layout:  { display: "flex", minHeight: "calc(100vh - 56px)" },
//   sidebar: { width: 160, background: "#3d2b00", padding: "16px 0", flexShrink: 0 },
//   sidebarItem: { padding: "14px 20px", color: "#ccc", fontSize: 14, cursor: "pointer" },
//   sidebarActive: { background: "#5a4010", color: "#f5a623", fontWeight: 700 },
//   content:    { flex: 1, padding: 28 },
//   pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
//   pageTitle:    { fontSize: 26, fontWeight: 800 },
//   pageSubtitle: { fontSize: 13, color: "#888", marginTop: 4 },
//   headerActions: { display: "flex", gap: 12 },
//   backBtn: {
//     border: "1px solid #ccc", background: "#fff",
//     padding: "10px 28px", borderRadius: 6,
//     fontSize: 15, cursor: "pointer", fontWeight: 600,
//   },
//   saveBtn: {
//     background: "#f5a623", border: "none",
//     padding: "10px 36px", borderRadius: 6,
//     fontSize: 15, fontWeight: 700, cursor: "pointer",
//   },
//   twoCol:   { display: "flex", gap: 20, alignItems: "flex-start" },
//   card:     { background: "#fff", borderRadius: 8, padding: "24px", flex: 1 },
//   rightCol: { width: 380, flexShrink: 0, display: "flex", flexDirection: "column" as const, gap: 20 },
//   cardTitle: { fontSize: 20, fontWeight: 700, marginBottom: 12 },
//   divider:   { height: 1, background: "#eee", marginBottom: 20 },
//   label: { display: "block", fontSize: 14, color: "#555", marginBottom: 6 },
//   input: {
//     width: "100%", border: "none", borderRadius: 6,
//     padding: "12px 14px", fontSize: 14, outline: "none",
//     background: "#e8f0f7", boxSizing: "border-box" as const,
//   },
//   textarea: {
//     width: "100%", border: "none", borderRadius: 6,
//     padding: "12px 14px", fontSize: 14, outline: "none",
//     background: "#e8f0f7", boxSizing: "border-box" as const,
//     minHeight: 200, resize: "vertical" as const,
//     fontFamily: "Sarabun, sans-serif",
//   },
//   inputWrapper: { display: "flex", alignItems: "center", background: "#e8f0f7", borderRadius: 6, overflow: "hidden" },
//   inputPrefix: { padding: "12px 12px", fontSize: 14, color: "#888", background: "#e8f0f7" },
//   inputWithPrefix: { flex: 1, border: "none", background: "#e8f0f7", padding: "12px 14px 12px 0", fontSize: 14, outline: "none" },

//   uploadBox: {
//     border: "2px dashed #c8d8e8", borderRadius: 8,
//     padding: "20px", textAlign: "center" as const,
//     background: "#f0f6fb", cursor: "pointer",
//     marginBottom: 10, position: "relative",
//     minHeight: 160, display: "flex", flexDirection: "column" as const,
//     alignItems: "center", justifyContent: "center",
//   },
//   previewImg: {
//     width: "100%", maxHeight: 200,
//     objectFit: "contain" as const, borderRadius: 6,
//   },
//   uploadingOverlay: {
//     position: "absolute", inset: 0,
//     background: "rgba(255,255,255,0.8)",
//     display: "flex", alignItems: "center", justifyContent: "center",
//     fontSize: 14, color: "#555", borderRadius: 8,
//   },
//   removeImgBtn: {
//     border: "1px solid #ddd", background: "#fff",
//     padding: "4px 12px", borderRadius: 4,
//     cursor: "pointer", fontSize: 12, color: "#e53e3e",
//     marginBottom: 8,
//   },
//   uploadIcon:    { fontSize: 28, marginBottom: 8 },
//   uploadText:    { fontSize: 14, color: "#555" },
//   uploadLink:    { color: "#3182ce", cursor: "pointer" },
//   uploadHint:    { fontSize: 12, color: "#aaa", marginTop: 4 },
//   uploadCaption: { fontSize: 12, color: "#888" },
// };

// export default ProductFormPage;

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

const API = "http://localhost:5000";

export function AddProductPage() {
  return <ProductFormPage mode="add" />;
}

export function EditProductPage() {
  return <ProductFormPage mode="edit" />;
}

function ProductFormPage({ mode }: { mode: "add" | "edit" }) {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string | undefined;
  const fileRef = useRef<HTMLInputElement>(null);

  // ดึง shop_id และ categories จาก user ที่ login อยู่
  const { user, loading: userLoading } = useCurrentUser();
  const [shopId, setShopId] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    product_name: "",
    description: "",
    price: "",
    quantity: "",
    image_url: "",
    local_cat_id: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchShopAndCats = async () => {
      if (!user?.user_id) return;
      try {
        const res = await fetch(`${API}/shops/user/${user.user_id}`);
        const shops = await res.json();
        const shopList = Array.isArray(shops) ? shops : (shops.data || []);
        
        if (shopList.length > 0) {
          const sId = shopList[0].shop_id;
          setShopId(sId);
          
          const catRes = await fetch(`${API}/categories/local/shop/${sId}`);
          const catJson = await catRes.json();
          setCategories(Array.isArray(catJson) ? catJson : (catJson.data || []));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchShopAndCats();
  }, [user]);

  useEffect(() => {
    if (mode !== "edit" || !productId) return;
    fetch(`${API}/products/${productId}`)
      .then((r) => r.json())
      .then((json) => {
        const p = json.data ?? json;
        setForm({
          product_name: p.product_name ?? "",
          description: p.description ?? "",
          price: String(p.price ?? ""),
          quantity: String(p.quantity ?? ""),
          image_url: p.image_url ?? "",
          local_cat_id: String(p.local_cat_id || ""),
        });
        if (p.image_url) setPreview(`${API}${p.image_url}`);
      })
      .catch(() => alert("Failed to load product"));
  }, [mode, productId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "อัปโหลดไม่สำเร็จ");
      setForm((prev) => ({ ...prev, image_url: json.data.url }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.product_name || !form.price) return alert("กรุณากรอกชื่อและราคา");

    // ตรวจสอบว่ามี shop_id ก่อน save
    if (!shopId) return alert("ไม่พบข้อมูลร้านค้า กรุณาลองใหม่อีกครั้ง");

    setSaving(true);
    try {
      if (mode === "edit" && productId) {
        await fetch(`${API}/products/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_name: form.product_name,
            description: form.description,
            price: parseFloat(form.price) || 0,
            image_url: form.image_url || null,
            local_cat_id: parseInt(form.local_cat_id) || undefined,
          }),
        });
        await fetch(`${API}/inventory/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: parseInt(form.quantity) || 0 }),
        });
      } else {
        await fetch(`${API}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shop_id: shopId,
            local_cat_id: parseInt(form.local_cat_id) || (categories.length > 0 ? categories[0].local_cat_id : 1),
            product_name: form.product_name,
            description: form.description,
            price: parseFloat(form.price) || 0,
            quantity: parseInt(form.quantity) || 0,
            image_url: form.image_url || null,
          }),
        });
      }
      router.push("/shop/product");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <AdminNavbar />

      <div style={styles.layout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarItem}>📊 Dashboard</div>
          <div style={{ ...styles.sidebarItem, ...styles.sidebarActive }}>
            📦 Products
          </div>
          <div style={styles.sidebarItem}>🧾 Orders</div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>
                {mode === "edit" ? "Edit Product" : "Add new Product"}
              </div>
              <div style={styles.pageSubtitle}>
                {mode === "edit"
                  ? "Update the details of your product."
                  : "Fill in details below to list a new item in your store."}
              </div>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.backBtn} onClick={() => router.back()}>
                Back
              </button>
              <button
                style={styles.saveBtn}
                onClick={handleSave}
                disabled={saving || uploading || userLoading}
              >
                {saving ? "กำลังบันทึก..." : "Save"}
              </button>
            </div>
          </div>

          <div style={styles.twoCol}>
            {/* Left */}
            <div style={styles.card}>
              <div style={styles.cardTitle}>Basic Information</div>
              <div style={styles.divider} />
              <label style={styles.label}>Product name</label>
              <input
                style={styles.input}
                placeholder="e.g. Lamp"
                value={form.product_name}
                onChange={(e) =>
                  setForm({ ...form, product_name: e.target.value })
                }
              />
              <label style={{ ...styles.label, marginTop: 20 }}>
                Description
              </label>
              <textarea
                style={styles.textarea}
                placeholder="Describe the product features, materials, etc."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* Right */}
            <div style={styles.rightCol}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Media</div>
                <div style={styles.divider} />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <div
                  style={styles.uploadBox}
                  onClick={() => fileRef.current?.click()}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      style={styles.previewImg}
                    />
                  ) : (
                    <>
                      <div style={styles.uploadIcon}>📁</div>
                      <div style={styles.uploadText}>
                        Drag & Drop or{" "}
                        <span style={styles.uploadLink}>Choose file</span> to
                        upload
                      </div>
                      <div style={styles.uploadHint}>
                        fig, zip, pdf, png, jpeg
                      </div>
                    </>
                  )}
                  {uploading && (
                    <div style={styles.uploadingOverlay}>กำลังอัปโหลด...</div>
                  )}
                </div>
                {preview && (
                  <button
                    style={styles.removeImgBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setForm((prev) => ({ ...prev, image_url: "" }));
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    ✕ ลบรูป
                  </button>
                )}
                <div style={styles.uploadCaption}>
                  Fill in your image details of your product.
                </div>
              </div>

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
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </div>
                <label style={{ ...styles.label, marginTop: 20 }}>
                  Number of stock
                </label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />

                <label style={{ ...styles.label, marginTop: 20 }}>
                  Category
                </label>
                <select
                  style={styles.input}
                  value={form.local_cat_id}
                  onChange={(e) =>
                    setForm({ ...form, local_cat_id: e.target.value })
                  }
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c: any) => (
                    <option key={c.local_cat_id} value={c.local_cat_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "Sarabun, sans-serif",
    background: "#f5f5f5",
    minHeight: "100vh",
  },
  layout: { display: "flex", minHeight: "calc(100vh - 56px)" },
  sidebar: {
    width: 160,
    background: "#3d2b00",
    padding: "16px 0",
    flexShrink: 0,
  },
  sidebarItem: {
    padding: "14px 20px",
    color: "#ccc",
    fontSize: 14,
    cursor: "pointer",
  },
  sidebarActive: { background: "#5a4010", color: "#f5a623", fontWeight: 700 },
  content: { flex: 1, padding: 28 },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  pageTitle: { fontSize: 26, fontWeight: 800 },
  pageSubtitle: { fontSize: 13, color: "#888", marginTop: 4 },
  headerActions: { display: "flex", gap: 12 },
  backBtn: {
    border: "1px solid #ccc",
    background: "#fff",
    padding: "10px 28px",
    borderRadius: 6,
    fontSize: 15,
    cursor: "pointer",
    fontWeight: 600,
  },
  saveBtn: {
    background: "#f5a623",
    border: "none",
    padding: "10px 36px",
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  twoCol: { display: "flex", gap: 20, alignItems: "flex-start" },
  card: { background: "#fff", borderRadius: 8, padding: "24px", flex: 1 },
  rightCol: {
    width: 380,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: 700, marginBottom: 12 },
  divider: { height: 1, background: "#eee", marginBottom: 20 },
  label: { display: "block", fontSize: 14, color: "#555", marginBottom: 6 },
  input: {
    width: "100%",
    border: "none",
    borderRadius: 6,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    background: "#e8f0f7",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    border: "none",
    borderRadius: 6,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    background: "#e8f0f7",
    boxSizing: "border-box",
    minHeight: 200,
    resize: "vertical",
    fontFamily: "Sarabun, sans-serif",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#e8f0f7",
    borderRadius: 6,
    overflow: "hidden",
  },
  inputPrefix: {
    padding: "12px 12px",
    fontSize: 14,
    color: "#888",
    background: "#e8f0f7",
  },
  inputWithPrefix: {
    flex: 1,
    border: "none",
    background: "#e8f0f7",
    padding: "12px 14px 12px 0",
    fontSize: 14,
    outline: "none",
  },
  uploadBox: {
    border: "2px dashed #c8d8e8",
    borderRadius: 8,
    padding: "20px",
    textAlign: "center",
    background: "#f0f6fb",
    cursor: "pointer",
    marginBottom: 10,
    position: "relative",
    minHeight: 160,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImg: {
    width: "100%",
    maxHeight: 200,
    objectFit: "contain",
    borderRadius: 6,
  },
  uploadingOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    color: "#555",
    borderRadius: 8,
  },
  removeImgBtn: {
    border: "1px solid #ddd",
    background: "#fff",
    padding: "4px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    color: "#e53e3e",
    marginBottom: 8,
  },
  uploadIcon: { fontSize: 28, marginBottom: 8 },
  uploadText: { fontSize: 14, color: "#555" },
  uploadLink: { color: "#3182ce", cursor: "pointer" },
  uploadHint: { fontSize: 12, color: "#aaa", marginTop: 4 },
  uploadCaption: { fontSize: 12, color: "#888" },
};

export default ProductFormPage;
