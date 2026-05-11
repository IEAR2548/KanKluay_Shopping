"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Package,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { fetchOrders, updateOrderStatus, deleteOrder } from "@/lib/api/orders";

type Order = {
  order_id: number;
  user_id: number;
  shop_id: number;
  customer_name: string;
  shop_name: string;
  total_amount: number;
  net_amount: number;
  platform_fee: number;
  payment_method: string;
  order_date: string;
  order_status: "pending" | "completed" | "cancelled";
  shipping_status: "shipping" | "delivered" | "returned";
};

type Tab = "all" | "pending" | "completed" | "cancelled";

const ORDER_STATUS_STYLE: Record<string, { color: string; dot: string }> = {
  pending: { color: "text-yellow-500", dot: "bg-yellow-400" },
  completed: { color: "text-green-600", dot: "bg-green-500" },
  cancelled: { color: "text-red-500", dot: "bg-red-500" },
};

const SHIPPING_STATUS_STYLE: Record<string, { color: string; dot: string }> = {
  shipping: { color: "text-blue-500", dot: "bg-blue-400" },
  delivered: { color: "text-green-600", dot: "bg-green-500" },
  returned: { color: "text-red-500", dot: "bg-red-500" },
};

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  // Modal states
  const [statusModal, setStatusModal] = useState<Order | null>(null);
  const [detailModal, setDetailModal] = useState<Order | null>(null);
  const [statusForm, setStatusForm] = useState({
    order_status: "",
    shipping_status: "",
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.order_status === "completed").length,
    pending: orders.filter((o) => o.order_status === "pending").length,
    cancelled: orders.filter((o) => o.order_status === "cancelled").length,
  };

  const statCards = [
    { title: "All Orders", value: stats.total, color: "text-gray-800" },
    { title: "Completed", value: stats.completed, color: "text-green-600" },
    { title: "Pending", value: stats.pending, color: "text-yellow-500" },
    { title: "Cancelled", value: stats.cancelled, color: "text-red-500" },
  ];

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "all" || o.order_status === activeTab;
    const matchSearch =
      search === "" ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.order_id).includes(search);
    return matchTab && matchSearch;
  });

  const openStatusModal = (o: Order) => {
    setStatusModal(o);
    setStatusForm({
      order_status: o.order_status,
      shipping_status: o.shipping_status,
    });
  };

  const handleStatusSave = async () => {
    if (!statusModal) return;
    try {
      await updateOrderStatus(statusModal.order_id, statusForm);
      setStatusModal(null);
      loadOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบ order นี้?")) return;
    await deleteOrder(id);
    loadOrders();
  };

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All Order", count: stats.total },
    { key: "completed", label: "Completed", count: stats.completed },
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "cancelled", label: "Cancelled", count: stats.cancelled },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition hover:shadow-md"
          >
            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 border-b border-gray-50">
          <div className="flex bg-[#FEF3C7] p-1 rounded-lg w-fit">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  activeTab === t.key
                    ? "bg-white text-gray-800 shadow-sm border border-yellow-200"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {t.label}{" "}
                <span className="ml-1 text-xs opacity-60">({t.count})</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order ID, Buyer..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow-400 w-full md:w-64 transition"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FEF3C7] text-gray-800 font-medium">
                <th className="px-6 py-4 text-left font-semibold">No.</th>
                <th className="px-6 py-4 text-left font-semibold">OrderId</th>
                <th className="px-6 py-4 text-left font-semibold">Buyer</th>
                <th className="px-6 py-4 text-left font-semibold">Total</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Order Status
                </th>
                <th className="px-6 py-4 text-left font-semibold">Shipping</th>
                <th className="px-6 py-4 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((o, i) => (
                  <tr
                    key={o.order_id}
                    className="hover:bg-gray-50/50 transition"
                  >
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-600">
                      #ORD-{String(o.order_id).padStart(5, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {o.customer_name}
                      </p>
                      <p className="text-xs text-gray-400">{o.shop_name}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      ฿{Number(o.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-opacity-10 ${ORDER_STATUS_STYLE[o.order_status].color} border border-current border-opacity-10`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${ORDER_STATUS_STYLE[o.order_status].dot}`}
                        />
                        <span className="capitalize text-xs font-bold">
                          {o.order_status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`flex items-center gap-1.5 ${SHIPPING_STATUS_STYLE[o.shipping_status].color}`}
                      >
                        <span className="capitalize text-xs font-medium">
                          {o.shipping_status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setDetailModal(o)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 transition"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => openStatusModal(o)}
                          className="p-1.5 text-gray-400 hover:text-yellow-500 transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(o.order_id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800">Order Information</h2>
              <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-100">
                #ORD-{String(detailModal.order_id).padStart(5, "0")}
              </span>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: "Customer", value: detailModal.customer_name },
                { label: "Shop Name", value: detailModal.shop_name },
                { label: "Payment", value: detailModal.payment_method || "-" },
                {
                  label: "Total Amount",
                  value: `฿${Number(detailModal.total_amount).toLocaleString()}`,
                  highlight: true,
                },
                {
                  label: "Net Profit",
                  value: `฿${Number(detailModal.net_amount).toLocaleString()}`,
                },
                {
                  label: "Date",
                  value: new Date(detailModal.order_date).toLocaleString(
                    "th-TH",
                  ),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-500">{row.label}</span>
                  <span
                    className={`font-medium ${row.highlight ? "text-green-600 text-lg" : "text-gray-800"}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50">
              <button
                onClick={() => setDetailModal(null)}
                className="w-full bg-white border border-gray-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition"
              >
                Close Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Management Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Update Status
            </h2>
            <p className="text-xs text-gray-400 mb-6 font-mono">
              ORDER ID: #ORD-{String(statusModal.order_id).padStart(5, "0")}
            </p>

            <div className="space-y-6">
              {/* Order Status Select */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Order Status
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(["pending", "completed", "cancelled"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setStatusForm((f) => ({ ...f, order_status: s }))
                      }
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition ${
                        statusForm.order_status === s
                          ? "border-yellow-400 bg-yellow-50 shadow-sm"
                          : "border-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${ORDER_STATUS_STYLE[s].dot}`}
                      />
                      <span
                        className={`capitalize text-sm font-semibold ${ORDER_STATUS_STYLE[s].color}`}
                      >
                        {s}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shipping Status Select */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Shipping Status
                </label>
                <select
                  value={statusForm.shipping_status}
                  onChange={(e) =>
                    setStatusForm((f) => ({
                      ...f,
                      shipping_status: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400"
                >
                  <option value="shipping">Shipping</option>
                  <option value="delivered">Delivered</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStatusModal(null)}
                className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSave}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-yellow-200"
              >
                Save Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
