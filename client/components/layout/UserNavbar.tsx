// "use client";

// import Link from "next/link";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function UserNavbar() {
//   const [search, setSearch] = useState("");
//   const router = useRouter();

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (search.trim())
//       router.push(`/?search=${encodeURIComponent(search.trim())}`);
//   };

//   return (
//     <nav className="bg-[#F5C518] px-6 py-2 flex items-center gap-4 sticky top-0 z-50 shadow-sm h-14">
//       {/* Logo */}
//       <div className="flex-1 flex justify-start">
//         <Link href="/" className="flex-shrink-0">
//           <img
//             src="/logo.png"
//             alt="KanKluay"
//             className="h-20 w-20 object-contain"
//           />
//         </Link>
//       </div>

//       {/* Search */}
//       <div className="flex-[2] flex justify-center">
//         <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
//           <div className="flex items-center bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search"
//               className="flex-1 px-4 py-2 text-sm outline-none text-gray-700"
//             />
//             <button
//               type="submit"
//               className="px-3 py-2 text-gray-400 hover:text-gray-700 transition"
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                 />
//               </svg>
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Right */}
//       <div className="flex-1 flex justify-end items-center gap-5 text-gray-800">
//         {/* <div className="ml-auto flex items-center gap-5 text-gray-800"> */}
//         {/* Notification */}
//         <button className="flex flex-col items-center gap-0.5 hover:opacity-70 transition">
//           <svg
//             className="w-6 h-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//             />
//           </svg>
//           <span className="text-[11px] font-medium">Notification</span>
//         </button>

//         {/* Cart */}
//         <Link
//           href="/cart"
//           className="flex flex-col items-center gap-0.5 hover:opacity-70 transition relative"
//         >
//           <div className="relative">
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
//               />
//             </svg>
//             <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
//               9
//             </span>
//           </div>
//           <span className="text-[11px] font-medium">My Cart</span>
//         </Link>

//         {/* Avatar + Name */}
//         <Link
//           href="/profile"
//           className="flex items-center gap-2 hover:opacity-70 transition"
//         >
//           <img
//             src="/logo.png"
//             alt="User"
//             className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
//           />
//           <span className="text-sm font-semibold">Aball</span>
//         </Link>
//       </div>
//     </nav>
//   );
// }

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function UserNavbar() {
  const [search, setSearch] = useState("");
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      // เรียก API Logout
      await fetch(`${apiUrl}/auth/logout`, {
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
        {/* Logout Button (เปลี่ยนจากกระดิ่งเดิม) */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 hover:text-red-600 transition-colors text-gray-800"
          title="Logout"
        >
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="text-[11px] font-medium">Logout</span>
        </button>

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
              9
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
            // skeleton ขณะโหลด
            <div className="w-8 h-8 rounded-full bg-yellow-300 animate-pulse" />
          ) : user?.image_url ? (
            <img
              src={user.image_url}
              alt={user.firstname}
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            // fallback initials avatar
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-xs font-bold text-yellow-600">
                {user ? user.firstname.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
          )}
          <span className="text-sm font-semibold">
            {loading ? "..." : user ? user.firstname : "Guest"}
          </span>
        </Link>
      </div>
    </nav>
  );
}
