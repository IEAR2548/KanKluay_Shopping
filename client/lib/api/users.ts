const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  const json = await res.json();
  return json.data;
};

export const createUser = async (data: object) => {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateUser = async (id: number, data: object) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateUserStatus = async (id: number, status: string) => {
  const res = await fetch(`${API_URL}/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const deleteUser = async (id: number) => {
  const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
  return res.json();
};