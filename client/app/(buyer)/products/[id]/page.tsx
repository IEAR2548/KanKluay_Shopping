// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Button from '@/components/ui/Button';
// import { fetchProductById, updateProduct } from '@/lib/api/products';

// interface Product {
//   product_id: number;
//   shop_id: number;
//   shop_name: string;
//   local_cat_id: number;
//   category_name: string;
//   product_name: string;
//   description?: string;
//   price: number;
//   quantity: number;
// }

// export default function ProductDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const [product, setProduct] = useState<Product | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     product_name: '',
//     description: '',
//     price: '',
//   });

//   useEffect(() => {
//     const loadProduct = async () => {
//       try {
//         setIsLoading(true);
//         const data = await fetchProductById(params.id as string);
//         setProduct(data);
//         setFormData({
//           product_name: data.product_name,
//           description: data.description || '',
//           price: data.price.toString(),
//         });
//       } catch (error) {
//         console.error('Error loading product:', error);
//         alert('Failed to load product');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadProduct();
//   }, [params.id]);

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     try {
//       if (!product) return;

//       await updateProduct(product.product_id, {
//         product_name: formData.product_name,
//         description: formData.description,
//         price: parseFloat(formData.price),
//       });

//       alert('Product updated successfully');
      
//       // Reload product data
//       const updatedProduct = await fetchProductById(params.id as string);
//       setProduct(updatedProduct);
//       setIsEditing(false);
//     } catch (error) {
//       console.error('Error updating product:', error);
//       alert('Failed to update product');
//     }
//   };

//   if (isLoading) {
//     return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
//   }

//   if (!product) {
//     return (
//       <div className="container mx-auto px-4 py-8 text-center">
//         <p className="text-red-500">Product not found</p>
//         <Button variant="primary" onClick={() => router.push('/products')} className="mt-4">
//           Back to Products
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <Button
//         variant="secondary"
//         onClick={() => router.push('/products')}
//         className="mb-6"
//       >
//         Back to Products
//       </Button>

//       <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
//         {!isEditing ? (
//           <div>
//             <div className="mb-6">
//               <h1 className="text-4xl font-bold mb-2">{product.product_name}</h1>
//               <p className="text-gray-600 text-lg mb-4">{product.description}</p>
//             </div>

//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <div>
//                 <p className="text-gray-600 text-sm">Shop</p>
//                 <p className="text-lg font-semibold">{product.shop_name}</p>
//               </div>
//               <div>
//                 <p className="text-gray-600 text-sm">Category</p>
//                 <p className="text-lg font-semibold">{product.category_name}</p>
//               </div>
//               <div>
//                 <p className="text-gray-600 text-sm">Price</p>
//                 <p className="text-lg font-semibold text-blue-600">${(parseFloat(product.price as any) || 0).toFixed(2)}</p>
//               </div>
//               <div>
//                 <p className="text-gray-600 text-sm">Stock</p>
//                 <p className="text-lg font-semibold">{product.quantity} units</p>
//               </div>
//             </div>

//             <Button variant="primary" onClick={() => setIsEditing(true)}>
//               Edit Product
//             </Button>
//           </div>
//         ) : (
//           <div>
//             <h2 className="text-2xl font-bold mb-6">Edit Product</h2>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Product Name</label>
//                 <input
//                   type="text"
//                   name="product_name"
//                   value={formData.product_name}
//                   onChange={handleInputChange}
//                   className="w-full border border-gray-300 rounded px-3 py-2"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Description</label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   rows={4}
//                   className="w-full border border-gray-300 rounded px-3 py-2"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Price</label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={formData.price}
//                   onChange={handleInputChange}
//                   step="0.01"
//                   className="w-full border border-gray-300 rounded px-3 py-2"
//                 />
//               </div>

//               <div className="flex gap-4">
//                 <Button variant="primary" onClick={handleSubmit}>
//                   Save Changes
//                 </Button>
//                 <Button variant="secondary" onClick={() => setIsEditing(false)}>
//                   Cancel
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchProductById } from '@/lib/api/products';
import { addToCart } from '@/lib/api/cart';

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

const PLACEHOLDER = 'https://placehold.co/400x400/f5f5f5/aaaaaa?text=No+Image';
// Demo user_id — ในระบบจริงให้มาจาก session/auth
const DEMO_USER_ID = 2;

export default function ProductDetailPage() {
  const params = useParams();
  const id     = Number(params.id);

  const [product, setProduct]     = useState<Product | null>(null);
  const [loading, setLoading]     = useState(true);
  const [qty, setQty]             = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding]       = useState(false);
  const [added, setAdded]         = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductById(id)
      .then(data => setProduct(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.quantity === 0) return;
    setAdding(true);
    try {
      await addToCart(DEMO_USER_ID, product.product_id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="bg-white rounded-xl p-20 text-center text-gray-400">ไม่พบสินค้า</div>
  );

  const mainImg  = product.image_url || PLACEHOLDER;
  const thumbs   = [mainImg, mainImg, mainImg, mainImg];

  return (
    <div className="space-y-4">

      {/* ── Main Card ───────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex gap-6 p-6">

          {/* Left: Images */}
          <div className="flex-shrink-0 w-64">
            {/* Main */}
            <div className="w-64 h-64 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
              <img
                src={thumbs[activeImg]}
                alt={product.product_name}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-1.5 mt-2">
              {thumbs.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-14 h-14 rounded overflow-hidden border-2 transition flex-shrink-0 ${
                    activeImg === i
                      ? 'border-yellow-400'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Share + Favorite */}
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <span>แชร์:</span>
              <button className="hover:opacity-70 text-blue-600 font-bold">f</button>
              <button className="hover:opacity-70 text-blue-400 font-bold">m</button>
              <button className="hover:opacity-70 text-slate-700 font-bold">𝕏</button>
              <button className="hover:opacity-70 text-pink-500">📷</button>
              <span className="w-px h-3 bg-gray-300 mx-1" />
              <button className="flex items-center gap-1 hover:text-red-500 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorite
              </button>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-medium text-gray-800 leading-snug mb-3">
              {product.product_name}
            </h1>

            {/* Price */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 mb-3">
              <span className="text-2xl font-bold text-[#F5A623]">
                ฿{Number(product.price).toLocaleString()}
              </span>
            </div>

            {/* Bundle Deals */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500">Bundle Deals</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Shipping */}
            <div className="flex gap-6 py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500 w-24 flex-shrink-0">การจัดส่ง</span>
              <div>
                <div className="flex items-center gap-1 text-gray-700 text-xs">
                  จะได้รับภายใน 12 พ.ค. - 19 พ.ค.
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-medium text-xs mt-0.5">ส่งฟรี</p>
              </div>
            </div>

            {/* Return */}
            <div className="flex gap-6 py-2 border-b border-gray-100 text-sm mb-3">
              <span className="text-gray-500 w-24 flex-shrink-0">คืนกล้วยการันตี</span>
              <span className="text-gray-700 text-xs">เก็บเงินปลายทาง</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <span className="text-gray-500">จำนวน</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition text-lg"
                >−</button>
                <span className="w-10 text-center text-sm font-medium border-x border-gray-200 py-1">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => Math.min(product.quantity || 99, q + 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition text-lg"
                >+</button>
              </div>
              <span className="text-xs text-gray-400">
                {product.quantity > 0
                  ? `มีสินค้า ${product.quantity} ชิ้น`
                  : 'สินค้าหมด'}
              </span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={adding || product.quantity === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition ${
                added
                  ? 'bg-green-500 text-white'
                  : product.quantity === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#F5C518] hover:bg-yellow-400 text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {adding ? 'กำลังเพิ่ม...' : added ? '✓ เพิ่มแล้ว' : 'เพิ่มไปยังรถเข็น'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Shop Info ────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
            <img
              src={product.shop_logo || `https://api.dicebear.com/7.x/initials/svg?seed=${product.shop_name}`}
              alt={product.shop_name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name + buttons */}
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm mb-2">{product.shop_name}</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-1 rounded text-xs hover:bg-gray-50 transition">
                🏪 แชทเลย
              </button>
              <button className="flex items-center gap-1.5 border border-gray-300 text-gray-600 px-3 py-1 rounded text-xs hover:bg-gray-50 transition">
                🏠 ดูร้านค้า
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs border-l border-gray-100 pl-6">
            {[
              { label: 'คะแนน',        value: '7' },
              { label: 'เข้าร่วมเมื่อ', value: '33 วันที่ผ่านมา' },
              { label: 'รายการสินค้า', value: '47' },
              { label: 'ผู้ติดตาม',    value: '11' },
            ].map(s => (
              <div key={s.label} className="flex justify-between gap-4">
                <span className="text-gray-500">{s.label}</span>
                <span className="text-orange-500 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Specs ────────────────────────────────── */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3 mb-4">
          ข้อมูลจำเพาะของสินค้า
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex gap-8">
            <span className="text-gray-500 w-20 flex-shrink-0">หมวดหมู่</span>
            <span className="text-gray-700">{product.category_name}</span>
          </div>
          <div className="flex gap-8">
            <span className="text-gray-500 w-20 flex-shrink-0">ส่งจาก</span>
            <span className="text-gray-700">เก็บเงินปลายทาง</span>
          </div>
        </div>

        {product.description && (
          <>
            <h3 className="text-sm font-semibold text-gray-800 mt-5 mb-2">รายละเอียดสินค้า</h3>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </>
        )}
      </div>

    </div>
  );
}