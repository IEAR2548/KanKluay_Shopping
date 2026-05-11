// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// export const fetchCartByUser = async (userId: number) => {
//   const res = await fetch(`${API_URL}/cart/user/${userId}`);
//   return res.json();
// };

// export const addToCart = async (userId: number, productId: number, quantity: number) => {
//   const res = await fetch(`${API_URL}/cart`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ user_id: userId, product_id: productId, quantity }),
//   });
//   return res.json();
// };

// export const removeFromCart = async (cartId: number, productId: number) => {
//   const res = await fetch(`${API_URL}/cart/${cartId}/items/${productId}`, {
//     method: 'DELETE',
//   });
//   return res.json();
// };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 1. ดึงข้อมูลตะกร้า (เช็ค Path ให้ตรงกับ router.get('/:userId'))
export const fetchCartByUser = async (userId: number) => {
  const res = await fetch(`${API_URL}/cart/${userId}`); // แก้จาก /cart/user/${userId}
  return res.json();
};

// 2. เพิ่มสินค้า (เช็ค Path ให้ตรงกับ router.post('/:userId/items'))
export const addToCart = async (userId: number, productId: number, quantity: number) => {
  const res = await fetch(`${API_URL}/cart/${userId}/items`, { // ต้องส่ง userId ใน URL และต่อด้วย /items
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId, quantity }), // ส่งแค่ product_id และ quantity เพราะ userId อยู่ใน URL แล้ว
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'ไม่สามารถเพิ่มสินค้าได้');
  }
  return res.json();
};

// 3. ลบสินค้า (เช็ค Path ให้ตรงกับ router.delete('/:userId/items/:productId'))
// หมายเหตุ: Backend คุณใช้ userId ไม่ใช่ cartId ใน URL
export const removeFromCart = async (userId: number, productId: number) => {
  const res = await fetch(`${API_URL}/cart/${userId}/items/${productId}`, {
    method: 'DELETE',
  });
  return res.json();
};