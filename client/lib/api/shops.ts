const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Shop {
  shop_id: number;
  user_id: number;
  shop_name: string;
  shop_description: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

export async function fetchAllShops(): Promise<Shop[]> {
  const response = await fetch(`${API_URL}/shops`);
  if (!response.ok) throw new Error('Failed to fetch shops');
  const json = await response.json();
  // Backend may return { data: [...] } or a direct array
  return Array.isArray(json) ? json : (json.data ?? []);
}

export async function fetchShopById(id: number): Promise<Shop> {
  const response = await fetch(`${API_URL}/shops/${id}`);
  if (!response.ok) throw new Error('Failed to fetch shop');
  return response.json();
}

export async function createShop(data: Omit<Shop, 'shop_id' | 'created_at' | 'updated_at'>): Promise<Shop> {
  const response = await fetch(`${API_URL}/shops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create shop');
  return response.json();
}

export async function updateShop(id: number, data: Partial<Shop>): Promise<Shop> {
  const response = await fetch(`${API_URL}/shops/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update shop');
  return response.json();
}

export async function deleteShop(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/shops/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete shop');
}
