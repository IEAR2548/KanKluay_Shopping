"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UserNavbar() {
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [shops, setShops] = useState<any[]>([]);
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim())
      router.push(`/?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out?")) return;

    try {
      // เรียก API Logout
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // สำคัญมาก: ต้องใส่ credentials เพื่อให้จัดการ Cookie ได้
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // ลบ token ใน localStorage (ถ้ามีเก็บไว้)
      localStorage.removeItem("token");

      // ดีดไปหน้า login และล้าง state ทั้งหมดโดยการเปลี่ยนหน้าจริง
      window.location.href = "/login";
    }
  };

  const fetchCartCount = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/cart/${user.user_id}`);
      const json = await res.json();
      // data.items คือ array ของสินค้าใน cart
      const items = json.data?.items || [];
      setCartCount(items.length);
    } catch (err) {
      console.error("Fetch cart count error:", err);
    }
  };

  const fetchUserShops = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/shops/user/${user.user_id}`);
      if (res.ok) {
        const json = await res.json();
        setShops(Array.isArray(json) ? json : json.data || []);
      } else {
        setShops([]);
      }
    } catch (err) {
      console.error("Fetch user shops error:", err);
      setShops([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartCount();
      fetchUserShops();
    } else {
      setCartCount(0);
      setShops([]);
    }
  }, [user]);

  const imageUrl = user?.image_url;
  const userImage = imageUrl
    ? (imageUrl.startsWith('http') || imageUrl.startsWith('data:') ? imageUrl : `${API}${imageUrl}`)
    : null;

  return (
    <nav className="bg-[#F5C518] px-6 py-2 flex items-center gap-4 sticky top-0 z-50 shadow-sm h-14">
      {/* Logo */}
      <div className="flex-1 flex justify-start">
        <Link href="/" className="flex-shrink-0">
          <img
            src="/logo.png"
            alt="KanKluay"
            className="h-20 w-20 object-contain"
          />
        </Link>
      </div>

      {/* Search */}
      <div className="flex-[2] flex justify-center">
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="flex items-center bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 px-4 py-2 text-sm outline-none text-gray-700"
            />
            <button
              type="submit"
              className="px-3 py-2 text-gray-400 hover:text-gray-700 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Right */}
      <div className="flex-1 flex justify-end items-center gap-5 text-gray-800">
        {/* My Shop / Shop Select */}
        {shops.length > 0 && (
          <div className="relative group/shops">
            {shops.length === 1 ? (
              <Link 
                href={`/shop/dashboard?shopId=${shops[0].shop_id}`}
                className="flex flex-col items-center gap-0.5 hover:opacity-70 transition"
                onClick={() => localStorage.setItem('currentShopId', shops[0].shop_id)}
              >
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight">My Shop</span>
              </Link>
            ) : (
              <>
                <button className="flex flex-col items-center gap-0.5 hover:opacity-70 transition">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tight">My Shop</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover/shops:opacity-100 group-hover/shops:visible transition-all z-50">
                  <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Select Shop</p>
                  {shops.map((s: any) => (
                    <Link
                      key={s.shop_id}
                      href={`/shop/dashboard?shopId=${s.shop_id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition"
                      onClick={() => localStorage.setItem('currentShopId', s.shop_id)}
                    >
                      {s.shop_name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Admin Dashboard — only for admin role */}
        {user?.role === 'admin' && (
          <Link
            href="/admin/dashboard"
            className="flex flex-col items-center gap-0.5 hover:opacity-70 transition"
            title="Admin Dashboard"
          >
            <div className="p-1.5 bg-white/20 rounded-lg">
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">Admin</span>
          </Link>
        )}

        {/* Cart */}
        <Link
          href="/cart"
          className="flex flex-col items-center gap-0.5 hover:opacity-70 transition relative"
        >
          <div className="relative">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
              {cartCount}
            </span>
          </div>
          <span className="text-[11px] font-medium">My Cart</span>
        </Link>

        {/* Avatar + Name */}
        <Link
          href="/profile"
          className="flex items-center gap-2 hover:opacity-70 transition"
        >
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-yellow-300 animate-pulse" />
          ) : userImage ? (
            <img
              src={userImage}
              alt={user?.firstname}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-xs font-bold text-yellow-600">
                {user ? user.firstname.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
          )}
          <span className="text-sm font-semibold">
            {loading ? "..." : user ? (user.firstname || user.username) : "Guest"}
          </span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 hover:text-red-600 transition-colors text-gray-800"
          title="Logout"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[11px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
