const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────

export interface SummaryCards {
  total_users: string;
  total_shops: string;
  total_transactions: string;
  pending_approvals: string;
  total_revenue: string;
}

export interface TrendPoint {
  date: string;
  total_orders: string;
  revenue: string;
}

export interface SubMetrics {
  total_users: string;
  total_shops: string;
  total_transactions: string;
  pending_approvals: string;
  total_revenue: string;
}

export interface RecentUsers {
  total: string;
  per_minute: { minute_bucket: string; users_last_30min: string }[];
}

export interface TopShop {
  shop_id: number;
  shop_name: string;
  total_orders: string;
  total_revenue: string;
}

export interface GrowthStats {
  new_users_30d: string;
  prev_users_30d: string;
  new_shops_30d: string;
  prev_shops_30d: string;
  new_orders_30d: string;
  prev_orders_30d: string;
}

// ─── Helper ───────────────────────────────────────────────

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

// ─── API Functions ────────────────────────────────────────

export const fetchDashboardSummary = () =>
  apiFetch<SummaryCards>("/dashboard/summary");

export const fetchTransactionsTrend = (params?: { range?: string }) =>
  apiFetch<TrendPoint[]>("/dashboard/trend", params as Record<string, string>);

export const fetchSubMetrics = () =>
  apiFetch<SubMetrics>("/dashboard/sub-metrics");

export const fetchRecentUsers = () =>
  apiFetch<RecentUsers>("/dashboard/recent-users");

export const fetchTopShops = (params?: { limit?: string }) =>
  apiFetch<TopShop[]>("/dashboard/top-shops", params as Record<string, string>);

export const fetchGrowthStats = () =>
  apiFetch<GrowthStats>("/dashboard/growth");