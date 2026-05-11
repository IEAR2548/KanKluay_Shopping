const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface User {
  user_id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone_number: string | null;
  role: string;
  status: string;
  image_url: string | null;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

// ทุก request ส่ง credentials เพื่อให้ cookie ไปด้วย
const fetchWithCreds = (url: string, options?: RequestInit) =>
  fetch(url, { credentials: "include", ...options });

/**
 * Register (step 1: phone → step 2: password)
 * ส่งข้อมูลครบในครั้งเดียวตอน submit password step
 */
export async function registerUser(data: {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  phone_number?: string;
}): Promise<AuthResponse> {
  const res = await fetchWithCreds(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "สมัครสมาชิกไม่สำเร็จ");
  return json;
}

/**
 * Login ด้วย email + password
 */
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetchWithCreds(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "เข้าสู่ระบบไม่สำเร็จ");
  return json;
}

/**
 * Logout — clear cookie
 */
export async function logoutUser(): Promise<void> {
  await fetchWithCreds(`${API_BASE}/auth/logout`, { method: "POST" });
}

/**
 * ดึงข้อมูล user ปัจจุบันจาก cookie (ใช้ใน server component หรือ client)
 */
export async function getMe(): Promise<User | null> {
  try {
    const res = await fetchWithCreds(`${API_BASE}/auth/me`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.user;
  } catch {
    return null;
  }
}