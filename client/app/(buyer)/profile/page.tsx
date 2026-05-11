'use client';

import { useState } from 'react';
import ProfileSidebar from '@/components/layout/ProfileSidebar';

// Demo user — ในระบบจริงมาจาก session/auth
const DEMO_USER = {
  user_id:      2,
  username:     'Sun2549',
  firstname:    'สมชาย',
  lastname:     'ใจดี',
  email:        'somchai@email.com',
  phone_number: '0812345678',
  image_url:    null as string | null,
};

const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS  = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);

export default function ProfileRecordPage() {
  const [form, setForm]       = useState({ name: '', sex: '', date: '', month: '', year: '' });
  const [preview, setPreview] = useState<string | null>(null);
  const [saved, setSaved]     = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert('File size must be under 1MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex gap-6">
      <ProfileSidebar username={DEMO_USER.username} imageUrl={preview || DEMO_USER.image_url} />

      {/* Main content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-lg font-semibold text-gray-800 mb-1">My Information</h1>
        <p className="text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
          Manage your personal information to ensure the security of this user account.
        </p>

        <div className="flex gap-8">
          {/* Form */}
          <div className="flex-1 space-y-5">
            {/* Username */}
            <div className="flex items-center">
              <label className="w-32 text-sm text-gray-500 text-right pr-6 flex-shrink-0">Username</label>
              <span className="text-sm text-gray-800 font-medium">{DEMO_USER.username}</span>
            </div>

            {/* Name */}
            <div className="flex items-center">
              <label className="w-32 text-sm text-gray-500 text-right pr-6 flex-shrink-0">name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-72 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Email */}
            <div className="flex items-center">
              <label className="w-32 text-sm text-gray-500 text-right pr-6 flex-shrink-0">Email</label>
              <button className="text-sm text-blue-500 hover:underline transition">Add</button>
            </div>

            {/* Phone */}
            <div className="flex items-center">
              <label className="w-32 text-sm text-gray-500 text-right pr-6 flex-shrink-0">Phone number</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  {'*'.repeat(DEMO_USER.phone_number.length - 2)}{DEMO_USER.phone_number.slice(-2)}
                </span>
                <button className="text-sm text-blue-500 hover:underline transition">Change</button>
              </div>
            </div>

            {/* Sex */}
            <div className="flex items-center">
              <label className="w-32 text-sm text-gray-500 text-right pr-6 flex-shrink-0">sex</label>
              <div className="flex items-center gap-5">
                {['man', 'female', 'other'].map(s => (
                  <label key={s} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="sex"
                      value={s}
                      checked={form.sex === s}
                      onChange={e => setForm(f => ({ ...f, sex: e.target.value }))}
                      className="accent-yellow-400 w-4 h-4"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center">
              <label className="w-32 text-sm text-gray-500 text-right pr-6 flex-shrink-0">Date of Birth</label>
              <div className="flex items-center gap-2">
                {/* Date */}
                <div className="relative">
                  <select
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm text-gray-500 outline-none focus:border-yellow-400 transition w-24"
                  >
                    <option value="">Date</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Month */}
                <div className="relative">
                  <select
                    value={form.month}
                    onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                    className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm text-gray-500 outline-none focus:border-yellow-400 transition w-28"
                  >
                    <option value="">month</option>
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Year */}
                <div className="relative">
                  <select
                    value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                    className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm text-gray-500 outline-none focus:border-yellow-400 transition w-24"
                  >
                    <option value="">year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center pt-2">
              <div className="w-32 flex-shrink-0" />
              <button
                onClick={handleSave}
                className={`px-8 py-2 rounded font-semibold text-sm transition ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-[#F5C518] hover:bg-yellow-400 text-gray-900'
                }`}
              >
                {saved ? 'Saved ✓' : 'Record'}
              </button>
            </div>
          </div>

          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            {/* Avatar preview */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-teal-400 flex items-center justify-center border-2 border-gray-200 shadow-sm">
              {preview ? (
                <img src={preview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {DEMO_USER.username.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Upload button */}
            <label className="cursor-pointer border border-gray-300 rounded px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition">
              Change A Picture
              <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
            </label>

            <div className="text-center text-xs text-gray-400 leading-relaxed">
              <p>File size: Maximum 1 MB</p>
              <p>Supported file types: JPEG, PNG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}