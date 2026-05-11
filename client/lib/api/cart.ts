const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const fetchCartByUser = async (userId: number) => {
  const res = await fetch(`${API_URL}/cart/user/${userId}`);
  return res.json();
};

export const addToCart = async (userId: number, productId: number, quantity: number) => {
  const res = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, product_id: productId, quantity }),
  });
  return res.json();
};

export const removeFromCart = async (cartId: number, productId: number) => {
  const res = await fetch(`${API_URL}/cart/${cartId}/items/${productId}`, {
    method: 'DELETE',
  });
  return res.json();
};