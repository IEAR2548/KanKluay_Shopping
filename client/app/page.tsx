// export default function Home() {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="text-center">
//         <h1 className="text-5xl font-bold mb-4">Welcome to KanKluay Shopping</h1>
//         <p className="text-xl text-gray-600 mb-8">
//           Your premier e-commerce platform for quality products and services
//         </p>
//         <div className="space-x-4">
//           <a
//             href="/products"
//             className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//           >
//             Browse Products
//           </a>
//           <a
//             href="/shops"
//             className="inline-block px-6 py-3 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
//           >
//             View Shops
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAllGlobalCategories } from '@/lib/api/categories';
import { fetchAllProducts } from '@/lib/api/products';
import UserNavbar from '@/components/layout/UserNavbar';

type Category = {
  global_cat_id: number;
  category_name: string;
  image_url: string | null;
};

type Product = {
  product_id: number;
  product_name: string;
  price: number;
  image_url: string | null;
  shop_name: string;
  quantity: number;
};

const PLACEHOLDER_PRODUCT = 'https://placehold.co/200x200/f5f5f5/aaaaaa?text=No+Image';
const PLACEHOLDER_CAT     = 'https://placehold.co/80x80/f5f5f5/aaaaaa?text=?';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts]     = useState<Product[]>([]);
  const [search, setSearch]         = useState('');

  useEffect(() => {
    fetchAllGlobalCategories().then(d => setCategories(Array.isArray(d) ? d : []));
    fetchAllProducts().then(d => setProducts(Array.isArray(d) ? d : []));

    const params = new URLSearchParams(window.location.search);
    setSearch(params.get('search') || '');
  }, []);

  const filtered = products.filter(p =>
    !search || p.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <UserNavbar />
      {/* ── Categories ─────────────────────────────────── */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Categories</h2>
        {categories.length === 0 ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-8 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.global_cat_id}
                href={`/?cat=${cat.global_cat_id}`}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-yellow-400 transition shadow-sm">
                  <img
                    src={cat.image_url || PLACEHOLDER_CAT}
                    alt={cat.category_name}
                    className="w-10 h-10 object-contain"
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_CAT; }}
                  />
                </div>
                <span className="text-[11px] text-gray-600 text-center leading-tight line-clamp-2 max-w-[72px]">
                  {cat.category_name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── ขายดีประจำสัปดาห์ ───────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-bold text-red-500 whitespace-nowrap">ขายดีประจำสัปดาห์</h2>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400 text-sm">
            ไม่พบสินค้า
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {filtered.map(p => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Product Card ──────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.product_id}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group block"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image_url || PLACEHOLDER_PRODUCT}
          alt={product.product_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_PRODUCT; }}
        />
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-red-500 px-2 py-0.5 rounded">หมด</span>
          </div>
        )}
        {product.quantity > 0 && product.quantity <= 5 && (
          <div className="absolute top-1.5 right-1.5 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
            เหลือน้อย
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs text-gray-700 line-clamp-2 min-h-[2.5rem] leading-snug">
          {product.product_name}
        </p>
        <div className="flex items-end justify-between mt-1.5">
          <p className="text-sm font-bold text-red-500">
            ฿{Number(product.price).toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight text-right">
            ขายได้ {Math.max(0, 100 - (product.quantity ?? 0))} ชิ้น
          </p>
        </div>
      </div>
    </Link>
  );
}