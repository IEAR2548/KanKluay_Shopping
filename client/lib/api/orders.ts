const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const fetchOrders = async () => {
  const res = await fetch(`${API_URL}/orders`);
  const json = await res.json();
  return json.data;
};

export const fetchOrderById = async (id: number) => {
  const res = await fetch(`${API_URL}/orders/${id}`);
  const json = await res.json();
  return json.data;
};

export const fetchOrdersByUser = async (userId: number) => {
  const res = await fetch(`${API_URL}/orders/user/${userId}`);
  const json = await res.json();
  return json.data;
};

export const fetchOrdersByShop = async (shopId: number) => {
  const res = await fetch(`${API_URL}/orders/shop/${shopId}`);
  const json = await res.json();
  return json.data;
};

export const createOrder = async (data: object) => {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateOrderStatus = async (id: number, data: { order_status?: string; shipping_status?: string }) => {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteOrder = async (id: number) => {
  const res = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
  return res.json();
};