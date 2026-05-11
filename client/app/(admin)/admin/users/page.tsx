'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ArrowUpDown, MoreHorizontal, 
  Edit, Trash2, ChevronLeft, ChevronRight, UserPlus 
} from 'lucide-react';
import { 
  fetchUsers, createUser, updateUser, 
  updateUserStatus, deleteUser 
} from "@/lib/api/users";

type User = {
  user_id: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone_number: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
};

type Tab = 'all' | 'active' | 'inactive' | 'suspended';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [statusModal, setStatusModal] = useState<User | null>(null);
  const [form, setForm] = useState({ 
    firstname: '', lastname: '', username: '', 
    email: '', password: '', phone_number: '', role: 'user' 
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  const statCards = [
    { title: 'Total User', value: stats.total.toString(), valueColor: 'text-gray-800' },
    { title: 'Active User', value: stats.active.toString(), valueColor: 'text-green-600' },
    { title: 'Inactive', value: stats.inactive.toString(), valueColor: 'text-yellow-500' },
    { title: 'Suspended', value: stats.suspended.toString(), valueColor: 'text-red-500' },
  ];

  const filtered = users.filter(u => {
    const matchTab = activeTab === 'all' || u.status === activeTab;
    const matchSearch = search === '' ||
      `${u.firstname} ${u.lastname}`.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // // Handlers
  // const openAdd = () => {
  //   setEditUser(null);
  //   setForm({ firstname: '', lastname: '', username: '', email: '', password: '', phone_number: '', role: 'user' });
  //   setShowModal(true);
  // };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ firstname: u.firstname, lastname: u.lastname, username: u.username, email: u.email, password: '', phone_number: u.phone_number || '', role: u.role });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editUser) await updateUser(editUser.user_id, form);
      else await createUser(form);
      setShowModal(false);
      loadUsers();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบ user นี้?')) return;
    await deleteUser(id);
    loadUsers();
  };

  const handleStatusChange = async (u: User, status: string) => {
    await updateUserStatus(u.user_id, status);
    setStatusModal(null);
    loadUsers();
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-[#FEF3C7] flex flex-col justify-between h-32">
            <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Updated just now
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
            {(['all', 'active', 'inactive', 'suspended'] as const).map((t) => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  activeTab === t 
                    ? 'bg-white text-gray-800 shadow-sm border border-yellow-200' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t} User <span className={activeTab === t ? 'text-yellow-600' : ''}>
                  ({t === 'all' ? stats.total : stats[t]})
                </span>
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search User" 
                className="pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-50/50"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><Filter className="w-4 h-4" /></button>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><ArrowUpDown className="w-4 h-4" /></button>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><MoreHorizontal className="w-4 h-4" /></button>
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
                <th className="py-3 px-4">UserId</th>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Join Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-500">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-500">No users found.</td></tr>
              ) : filtered.map((u, index) => (
                <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 w-4 h-4" />
                  </td>
                  <td className="py-4 px-4 text-gray-600">{index + 1}</td>
                  <td className="py-4 px-4 text-gray-500 font-mono text-xs">UID{String(u.user_id).padStart(6, '0')}</td>
                  <td className="py-4 px-4 text-gray-800 font-medium">{u.firstname} {u.lastname}</td>
                  <td className="py-4 px-4 text-gray-600">{u.email}</td>
                  <td className="py-4 px-4 text-gray-600 text-center">{new Date(u.created_at).toLocaleDateString('th-TH')}</td>
                  <td className="py-4 px-4">
                    <button 
                      onClick={() => setStatusModal(u)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-500' : u.status === 'suspended' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                      <span className={`text-sm capitalize font-medium ${u.status === 'active' ? 'text-green-600' : u.status === 'suspended' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {u.status}
                      </span>
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-yellow-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(u.user_id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Dummy */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#FCD34D] text-gray-800 font-medium text-sm">1</button>
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Modal (Keep your original logic but match style) */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Change Status</h2>
            <p className="text-sm text-gray-500 mb-4">{statusModal.firstname} {statusModal.lastname}</p>
            <div className="space-y-2">
              {(['active', 'inactive', 'suspended'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(statusModal, s)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition ${
                    statusModal.status === s ? 'border-yellow-400 bg-yellow-50' : 'border-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${s === 'active' ? 'bg-green-500' : s === 'suspended' ? 'bg-red-500' : 'bg-yellow-400'}`} />
                  <span className="capitalize font-medium text-gray-700">{s}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStatusModal(null)} className="w-full mt-4 text-gray-400 text-sm py-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (Your original logic) */}
      {showModal && (
         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
             <h2 className="text-xl font-bold text-gray-800 mb-4">{editUser ? 'Edit User' : 'Add New User'}</h2>
             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">FIRST NAME</label>
                  <input value={form.firstname} onChange={e => setForm({...form, firstname: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-yellow-400 outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">LAST NAME</label>
                  <input value={form.lastname} onChange={e => setForm({...form, lastname: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-yellow-400 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">EMAIL ADDRESS</label>
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-yellow-400 outline-none" />
                </div>
                {/* ... Add other fields as needed ... */}
             </div>
             <div className="flex gap-3 mt-6">
               <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-500 font-medium">Cancel</button>
               <button onClick={handleSubmit} className="flex-1 py-2 bg-[#F5C518] rounded-lg font-bold text-gray-900 shadow-md hover:bg-yellow-400 transition">
                 {editUser ? 'Save Changes' : 'Create User'}
               </button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}