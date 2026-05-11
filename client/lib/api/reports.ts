// client/lib/api/reports.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────

export interface SummaryData {
  total_orders: string;
  total_revenue: string;
  total_platform_fee: string;
  total_net_amount: string;
  completed_orders: string;
  cancelled_orders: string;
  pending_orders: string;
}

export interface DailyRevenue {
  date: string;
  total_orders: string;
  revenue: string;
  platform_fee: string;
  net_amount: string;
}

export interface MonthlyRevenue {
  month: string;
  total_orders: string;
  revenue: string;
  platform_fee: string;
  net_amount: string;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  shop_name: string;
  global_category: string;
  total_quantity_sold: string;
  total_revenue: string;
}

export interface ShopRevenue {
  shop_id: number;
  shop_name: string;
  shop_status: string;
  total_orders: string;
  total_revenue: string;
  total_platform_fee: string;
  total_net_amount: string;
}

export interface PayoutItem {
  payout_id: number;
  shop_id: number;
  shop_name: string;
  order_id: number;
  payout_date: string;
  net_amount: string;
  status: string;
}

export interface PayoutStats {
  total_payouts: string;
  total_amount: string;
  pending_amount: string;
  pending_count: string;
  completed_amount: string;
  completed_count: string;
}

export interface CategoryRevenue {
  global_cat_id: number;
  category_name: string;
  total_quantity_sold: string;
  total_revenue: string;
}

export interface OrderStatusBreakdown {
  order_status: string;
  shipping_status: string;
  count: string;
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

export const fetchSummary = (params?: { startDate?: string; endDate?: string }) =>
  apiFetch<SummaryData>("/reports/summary", params as Record<string, string>);

export const fetchDailyRevenue = (params: { startDate: string; endDate: string }) =>
  apiFetch<DailyRevenue[]>("/reports/revenue/daily", params);

export const fetchMonthlyRevenue = (params?: { year?: string }) =>
  apiFetch<MonthlyRevenue[]>("/reports/revenue/monthly", params as Record<string, string>);

export const fetchTopProducts = (params?: { limit?: string; startDate?: string; endDate?: string }) =>
  apiFetch<TopProduct[]>("/reports/top-products", params as Record<string, string>);

export const fetchRevenueByShop = (params?: { limit?: string; startDate?: string; endDate?: string }) =>
  apiFetch<ShopRevenue[]>("/reports/revenue/shops", params as Record<string, string>);

export const fetchPayouts = (params?: { status?: string; startDate?: string; endDate?: string }) =>
  apiFetch<PayoutItem[]>("/reports/payouts", params as Record<string, string>);

export const fetchPayoutStats = () =>
  apiFetch<PayoutStats>("/reports/payouts/stats");

export const fetchRevenueByCategory = (params?: { startDate?: string; endDate?: string }) =>
  apiFetch<CategoryRevenue[]>("/reports/revenue/categories", params as Record<string, string>);

export const fetchOrderStatusBreakdown = (params?: { startDate?: string; endDate?: string }) =>
  apiFetch<OrderStatusBreakdown[]>("/reports/orders/status", params as Record<string, string>);