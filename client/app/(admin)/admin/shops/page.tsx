'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAllShops, Shop } from '@/lib/api/shops';

export default function ShopManagementPage() {
  const [activeTab, setActiveTab] = useState('All');

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const totalShopsCount = shops.length;
  const activeShopsCount = shops.filter(shop => shop.status === 'active').length;
  const inactiveShopsCount = shops.filter(shop => shop.status === 'inactive').length;
  const suspendedShopsCount = shops.filter(shop => shop.status === 'suspended').length;

  const statCards = [
    { title: 'Total Shop', value: totalShopsCount.toString(), valueColor: 'text-gray-800' },
    { title: 'Active Shop', value: activeShopsCount.toString(), valueColor: 'text-green-600' },
    { title: 'Inactive', value: inactiveShopsCount.toString(), valueColor: 'text-gray-400' },
    { title: 'Suspended', value: suspendedShopsCount.toString(), valueColor: 'text-red-500' },
  ];



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

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shop Management</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
            <h3 className="text-gray-800 font-semibold">{card.title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</span>
              <span className="text-sm font-medium text-green-500 flex items-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5"><path d="m18 15-6-6-6 6"/></svg>
                10.4%
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Previous Month <span className="text-green-500 font-medium">(+ 235)</span>
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
              onClick={() => setActiveTab('All')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'All' 
                  ? 'bg-white text-gray-800 shadow-sm border border-yellow-200' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Shop <span className={activeTab === 'All' ? 'text-green-600' : ''}>(2.5K)</span>
            </button>
            <button 
              onClick={() => setActiveTab('Active')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'Active' 
                  ? 'bg-white text-gray-800 shadow-sm border border-yellow-200' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Active Shop
            </button>
            <button 
              onClick={() => setActiveTab('Inactive')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'Inactive' 
                  ? 'bg-white text-gray-800 shadow-sm border border-yellow-200' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Inactive
            </button>
            <button 
              onClick={() => setActiveTab('Suspended')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'Suspended' 
                  ? 'bg-white text-gray-800 shadow-sm border border-yellow-200' 
                  : 'text-gray-600 hover:text-gray-800'
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
                className="pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-50/50"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#FEF3C7] text-gray-800 font-medium">
                <th className="py-3 px-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 w-4 h-4" />
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
                  <td colSpan={8} className="py-8 text-center text-gray-500">Loading shops...</td>
                </tr>
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">No shops found.</td>
                </tr>
              ) : shops.map((shop, index) => (
                <tr key={shop.shop_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 w-4 h-4" />
                  </td>
                  <td className="py-4 px-4 text-gray-600">{index + 1}</td>
                  <td className="py-4 px-4 text-gray-800 font-medium">{shop.user_id}</td>
                  <td className="py-4 px-4 text-gray-600">{shop.shop_name}</td>
                  <td className="py-4 px-4 text-gray-600 text-center">{shop.created_at ? new Date(shop.created_at).toISOString().split('T')[0] : '-'}</td>
                  <td className="py-4 px-4 text-gray-600 text-center">0</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${shop.status === 'active' ? 'bg-green-500' : shop.status === 'suspended' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                      <span className="text-sm text-gray-800 capitalize">
                        {shop.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-gray-600 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#FCD34D] text-gray-800 font-medium text-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">
              4
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">
              5
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">
              24
            </button>
          </div>

          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
