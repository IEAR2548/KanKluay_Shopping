'use client';

import { useState, useEffect } from 'react';
import ProfileSidebar from '@/components/layout/ProfileSidebar';

const API_URL     = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const DEMO_USER   = { user_id: 2, username: 'Sun2549', image_url: null as string | null };

type Address = {
  address_id:     number;
  user_id:        number;
  recipient_name: string;
  phone_number:   string;
  address_detail: string;
  is_default:     boolean;
};

type Form = {
  recipient_name: string;
  phone_number:   string;
  address_detail: string;
  is_default:     boolean;
};

const EMPTY_FORM: Form = { recipient_name: '', phone_number: '', address_detail: '', is_default: false };

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAddr, setEditAddr]   = useState<Address | null>(null);
  const [form, setForm]           = useState<Form>(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/users/${DEMO_USER.user_id}/addresses`);
      const json = await res.json();
      setAddresses(json.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditAddr(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (a: Address) => {
    setEditAddr(a);
    setForm({
      recipient_name: a.recipient_name,
      phone_number:   a.phone_number,
      address_detail: a.address_detail,
      is_default:     a.is_default,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editAddr) {
        await fetch(`${API_URL}/users/${DEMO_USER.user_id}/addresses/${editAddr.address_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`${API_URL}/users/${DEMO_USER.user_id}/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setShowModal(false);
      load();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบที่อยู่นี้?')) return;
    await fetch(`${API_URL}/users/${DEMO_USER.user_id}/addresses/${id}`, { method: 'DELETE' });
    load();
  };

  const handleSetDefault = async (a: Address) => {
    await fetch(`${API_URL}/users/${DEMO_USER.user_id}/addresses/${a.address_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...a, is_default: true }),
    });
    load();
  };

  return (
    <div className="flex gap-6">
      <ProfileSidebar username={DEMO_USER.username} imageUrl={DEMO_USER.image_url} />

      {/* Main */}
      <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-semibold text-gray-800">My Address</h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-[#F5C518] hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded text-sm transition"
          >
            + Add a new address
          </button>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Address</h2>

          {loading ? (
            <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
          ) : addresses.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">ยังไม่มีที่อยู่</p>
          ) : (
            <div className="space-y-5">
              {addresses.map(a => (
                <div key={a.address_id} className="flex items-start justify-between pb-5 border-b border-gray-100 last:border-0">
                  {/* Address info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-800 text-sm">{a.recipient_name}</p>
                      {/* edit link — only show if not default or show always */}
                      {!a.is_default && (
                        <div className="flex gap-3 text-xs">
                          <button onClick={() => openEdit(a)} className="text-blue-500 hover:underline">edit</button>
                          <button onClick={() => handleDelete(a.address_id)} className="text-blue-500 hover:underline">delete</button>
                        </div>
                      )}
                      {a.is_default && (
                        <button onClick={() => openEdit(a)} className="text-xs text-blue-500 hover:underline">edit</button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{a.phone_number}</p>
                    <p className="text-sm text-gray-600 mb-2">{a.address_detail}</p>
                    {a.is_default && (
                      <span className="inline-block border border-[#F5A623] text-[#F5A623] text-xs px-2 py-0.5 rounded">
                        Default Value
                      </span>
                    )}
                  </div>

                  {/* Set default button */}
                  <div className="flex-shrink-0 ml-6">
                    <button
                      onClick={() => !a.is_default && handleSetDefault(a)}
                      disabled={a.is_default}
                      className={`border border-gray-300 rounded px-4 py-1.5 text-sm transition ${
                        a.is_default
                          ? 'text-gray-300 cursor-default border-gray-200'
                          : 'text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      Set as Default
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base font-bold text-gray-800 mb-4">
              {editAddr ? 'Edit Address' : 'Add New Address'}
            </h2>
            <div className="space-y-3">
              {[
                { key: 'recipient_name', label: 'Recipient Name', type: 'text' },
                { key: 'phone_number',   label: 'Phone Number',   type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Address Detail</label>
                <textarea
                  value={form.address_detail}
                  onChange={e => setForm(prev => ({ ...prev, address_detail: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={e => setForm(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="accent-yellow-400 w-4 h-4"
                />
                Set as default address
              </label>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition"
              >Cancel</button>
              <button
                onClick={handleSave}
                className="flex-1 bg-[#F5C518] hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg py-2 text-sm transition"
              >
                {editAddr ? 'Save Changes' : 'Add Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}