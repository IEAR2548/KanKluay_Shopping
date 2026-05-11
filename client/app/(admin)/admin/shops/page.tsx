"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { fetchAllShops, updateShop, deleteShop, Shop } from "@/lib/api/shops";
import Modal from "@/components/ui/Modal";

export default function ShopManagementPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [editForm, setEditForm] = useState({
    shop_name: "",
    shop_description: "",
    status: "active",
  });

  const totalShopsCount = shops.length;
  const activeShopsCount = shops.filter(
    (shop) => shop.status === "active",
  ).length;
  const inactiveShopsCount = shops.filter(
    (shop) => shop.status === "inactive",
  ).length;
  const suspendedShopsCount = shops.filter(
    (shop) => shop.status === "suspended",
  ).length;

  const getMonthStats = (shopList: Shop[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let currentMonthCount = 0;
    let prevMonthCount = 0;

    shopList.forEach((shop) => {
      if (!shop.created_at) return;
      const d = new Date(shop.created_at);
      const m = d.getMonth();
      const y = d.getFullYear();

      if (y === currentYear && m === currentMonth) {
        currentMonthCount++;
      } else if (
        (y === currentYear && m === currentMonth - 1) ||
        (currentMonth === 0 && y === currentYear - 1 && m === 11)
      ) {
        prevMonthCount++;
      }
    });

    const diff = currentMonthCount - prevMonthCount;
    const diffStr = diff >= 0 ? `+ ${diff}` : `- ${Math.abs(diff)}`;
    const color = diff >= 0 ? "text-green-500" : "text-red-500";
    let pct = 0;
    if (prevMonthCount === 0) {
      pct = currentMonthCount > 0 ? 100 : 0;
    } else {
      pct = ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100;
    }

    return { diffStr, color, pct: pct.toFixed(1) };
  };

  const statCards = [
    {
      title: "Total Shop",
      value: totalShopsCount.toString(),
      valueColor: "text-gray-800",
      stats: getMonthStats(shops),
    },
    {
      title: "Active Shop",
      value: activeShopsCount.toString(),
      valueColor: "text-green-600",
      stats: getMonthStats(shops.filter((s) => s.status === "active")),
    },
    {
      title: "Inactive",
      value: inactiveShopsCount.toString(),
      valueColor: "text-gray-400",
      stats: getMonthStats(shops.filter((s) => s.status === "inactive")),
    },
    {
      title: "Suspended",
      value: suspendedShopsCount.toString(),
      valueColor: "text-red-500",
      stats: getMonthStats(shops.filter((s) => s.status === "suspended")),
    },
  ];

  // filtering
  const filteredShops = shops.filter((shop) => {
    const matchesTab =
      activeTab === "All" ||
      shop.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      search.trim() === "" ||
      shop.shop_name.toLowerCase().includes(search.toLowerCase()) ||
      String(shop.user_id).includes(search);
    return matchesTab && matchesSearch;
  });

  // reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  useEffect(() => {
    const loadShops = async () => {
      try {
        const data = await fetchAllShops();
        setShops(data);
      } catch (err) {
        console.error("Failed to load shops", err);
      } finally {
        setLoading(false);
      }
    };
    loadShops();
  }, []);

  const handleEditClick = (shop: Shop) => {
    setEditingShop(shop);
    setEditForm({
      shop_name: shop.shop_name,
      shop_description: shop.shop_description || "",
      status: shop.status,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (shopId: number) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;
    try {
      await deleteShop(shopId);
      const data = await fetchAllShops();
      setShops(data);
    } catch (error) {
      console.error("Failed to delete shop", error);
      alert("Failed to delete shop");
    }
  };

  const handleEditSubmit = async () => {
    if (!editingShop) return;
    try {
      await updateShop(editingShop.shop_id, editForm as Partial<Shop>);
      const data = await fetchAllShops();
      setShops(data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update shop", error);
      alert("Failed to update shop");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shop Management</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-32"
          >
            <h3 className="text-gray-800 font-semibold">{card.title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-bold ${card.valueColor}`}>
                {card.value}
              </span>
              <span
                className={`text-sm font-medium ${card.stats.color} flex items-center`}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-0.5"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
                {card.stats.pct}%
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Previous Month{" "}
              <span className={`${card.stats.color} font-medium`}>
                ({card.stats.diffStr})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100">
          {/* Tabs */}
          <div className="flex items-center bg-[#FEF3C7] rounded-lg p-1">
            <button
              onClick={() => setActiveTab("All")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "All"
                  ? "bg-white text-gray-800 shadow-sm border border-yellow-200"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              All Shop{" "}
              <span className={activeTab === "All" ? "text-green-600" : ""}>
                ({totalShopsCount})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("Active")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "Active"
                  ? "bg-white text-gray-800 shadow-sm border border-yellow-200"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Active Shop
            </button>
            <button
              onClick={() => setActiveTab("Inactive")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "Inactive"
                  ? "bg-white text-gray-800 shadow-sm border border-yellow-200"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Inactive
            </button>
            <button
              onClick={() => setActiveTab("Suspended")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "Suspended"
                  ? "bg-white text-gray-800 shadow-sm border border-yellow-200"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Suspended
            </button>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Shop"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-50/50"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#FEF3C7] text-gray-800 font-medium">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 w-4 h-4"
                  />
                </th>
                <th className="py-3 px-4 w-16">No.</th>
                <th className="py-3 px-4">ShopId</th>
                <th className="py-3 px-4">Shop Name</th>
                <th className="py-3 px-4 text-center">Join Date</th>
                <th className="py-3 px-4 text-center">Transactions</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Loading shops...
                  </td>
                </tr>
              ) : paginatedShops.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No shops found.
                  </td>
                </tr>
              ) : (
                paginatedShops.map((shop, index) => (
                  <tr
                    key={shop.shop_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 w-4 h-4"
                      />
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-4 px-4 text-gray-800 font-medium">
                      {shop.user_id}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {shop.shop_name}
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-center">
                      {shop.created_at
                        ? new Date(shop.created_at).toISOString().split("T")[0]
                        : "-"}
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-center">0</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${shop.status === "active" ? "bg-green-500" : shop.status === "suspended" ? "bg-red-500" : "bg-gray-400"}`}
                        ></div>
                        <span className="text-sm text-gray-800 capitalize">
                          {shop.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditClick(shop)}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(shop.shop_id)}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                    currentPage === pageNum
                      ? "bg-[#FCD34D] text-gray-800 font-medium"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        title="Edit Shop"
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        submitButtonText="Save Changes"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              value={editForm.shop_name}
              onChange={(e) =>
                setEditForm({ ...editForm, shop_name: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editForm.shop_description}
              onChange={(e) =>
                setEditForm({ ...editForm, shop_description: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={editForm.status}
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
