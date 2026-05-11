"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProductById } from "@/lib/api/products";
import { addToCart } from "@/lib/api/cart";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

type Product = {
  product_id: number;
  product_name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  shop_id: number;
  shop_name: string;
  shop_logo: string | null;
  category_name: string;
  quantity: number;
};

const PLACEHOLDER = "https://placehold.co/400x400/f5f5f5/aaaaaa?text=No+Image";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // ดึงข้อมูล User จาก Hook (ไม่ต้อง Hardcode ID แล้ว)
  const { user, loading: userLoading } = useCurrentUser();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductById(id)
      .then((data) => setProduct(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    // 1. ตรวจสอบว่า Login หรือยัง
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงรถเข็น");
      router.push("/login");
      return;
    }

    // 2. ตรวจสอบเงื่อนไขสินค้า
    if (!product || product.quantity === 0) return;
    if (adding) return;

    setAdding(true);
    try {
      // 3. ใช้ user.user_id จากระบบ Auth จริง
      await addToCart(user.user_id, product.product_id, qty);

      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (e) {
      console.error("Add to cart failed:", e);
      alert("ไม่สามารถเพิ่มสินค้าลงรถเข็นได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setAdding(false);
    }
  };

  if (loading || userLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!product)
    return (
      <div className="bg-white rounded-xl p-20 text-center text-gray-400">
        ไม่พบสินค้า
      </div>
    );

  const mainImg = product.image_url
    ? `http://localhost:5000${product.image_url}`
    : PLACEHOLDER;
  const thumbs = [mainImg, mainImg, mainImg, mainImg]; // Demo thumbnails ใช้รูปหลักไปก่อน

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* ── Main Product Card ───────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 p-6">
          {/* Left: Images */}
          <div className="flex-shrink-0 w-full md:w-80">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
              <img
                src={thumbs[activeImg]}
                alt={product.product_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER;
                }}
              />
            </div>

            <div className="flex gap-2 mt-3">
              {thumbs.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded overflow-hidden border-2 transition ${
                    activeImg === i
                      ? "border-yellow-400"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-xl font-semibold text-gray-900 leading-snug">
              {product.product_name}
            </h1>

            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-3xl font-bold text-[#F5A623]">
                ฿{Number(product.price).toLocaleString()}
              </span>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-4 border-b border-gray-50 pb-2">
                <span className="w-24 text-gray-400">การจัดส่ง</span>
                <span className="text-green-600 font-medium">
                  ส่งฟรีเมื่อสั่งซื้อครบตามเงื่อนไข
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="w-24 text-gray-400">จำนวน</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-xl"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-semibold border-x border-gray-200">
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty((q) => Math.min(product.quantity || 99, q + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-xl"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-400">
                  มีสินค้าทั้งหมด {product.quantity} ชิ้น
                </span>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={adding || product.quantity === 0}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-3 rounded-lg font-bold transition shadow-sm ${
                  added
                    ? "bg-green-500 text-white"
                    : product.quantity === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#F5C518] hover:bg-yellow-400 text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {adding
                  ? "กำลังเพิ่ม..."
                  : added
                    ? "เพิ่มลงรถเข็นแล้ว"
                    : "เพิ่มไปยังรถเข็น"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shop Info ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border flex-shrink-0">
          <img
            src={
              product.shop_logo ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${product.shop_name}`
            }
            alt={product.shop_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{product.shop_name}</h3>
          <div className="flex gap-2 mt-2">
            <button className="text-xs border border-yellow-500 text-yellow-600 px-3 py-1 rounded hover:bg-yellow-50">
              แชทเลย
            </button>
            <button className="text-xs border border-gray-300 text-gray-600 px-3 py-1 rounded hover:bg-gray-50">
              ดูร้านค้า
            </button>
          </div>
        </div>
      </div>

      {/* ── Description ────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
          รายละเอียดสินค้า
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
          <div className="flex gap-4">
            <span className="text-gray-400 w-24">หมวดหมู่</span>
            <span className="text-blue-600">{product.category_name}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-400 w-24">ส่งจาก</span>
            <span className="text-gray-900 font-medium">กรุงเทพมหานคร</span>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
          {product.description || "ไม่มีรายละเอียดสินค้า"}
        </p>
      </div>
    </div>
  );
}
