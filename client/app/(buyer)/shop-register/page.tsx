'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ShopRegisterPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  
  const [form, setForm] = useState({
    shop_name: '',
    shop_description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API}/shops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          shop_name: form.shop_name,
          shop_description: form.shop_description,
        }),
      });

      if (!res.ok) throw new Error('Failed to register shop');

      alert('Shop registered successfully!');
      router.push('/shop/dashboard');
    } catch (err) {
      console.error(err);
      alert('Error registering shop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Shop</h1>
        <p className="text-gray-500 mb-8 text-lg">Start selling your products on KanKluay today!</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Name</label>
            <input
              required
              type="text"
              value={form.shop_name}
              onChange={e => setForm({ ...form, shop_name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20 outline-none transition"
              placeholder="Enter your shop name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Description</label>
            <textarea
              rows={4}
              value={form.shop_description}
              onChange={e => setForm({ ...form, shop_description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20 outline-none transition resize-none"
              placeholder="Tell us about your shop..."
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#F5C518] hover:bg-yellow-400 text-gray-900 font-bold rounded-xl shadow-lg shadow-yellow-400/20 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Registering...' : 'Open Shop Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
