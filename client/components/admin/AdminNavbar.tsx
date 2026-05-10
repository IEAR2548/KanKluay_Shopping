// 'use client';

// export default function AdminNavbar() {
//   return (
//     <div className="bg-[#F5C518] px-4 py-2 flex items-center gap-4 h-14">
//       <button className="text-gray-800 text-xl font-bold w-8">☰</button>

//       {/* Right side */}
//       <div className="ml-auto flex items-center gap-5 text-gray-800 text-xs font-medium">
//         {/* Open Shop */}
//         <button className="flex flex-col items-center gap-0.5 hover:opacity-70 transition">
//           <span className="text-lg">🏠</span>
//           {/* <span>Open Shop</span> */}
//         </button>

//         {/* My Cart */}
//         <button className="flex flex-col items-center gap-0.5 hover:opacity-70 transition relative">
//           <span className="text-lg">🛒</span>
//           <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">9</span>
//           {/* <span>My Cart</span> */}
//         </button>

//         {/* Admin profile */}
//         <button className="flex items-center gap-2 hover:opacity-70 transition">
//           <img
//             src="/logo.png"
//             alt="Admin"
//             className="w-8 h-8 rounded-full object-cover border-2 border-white"
//           />
//           <span className="font-semibold text-sm">[Admin] Ozone</span>
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import UserAvatar from "../user/UserAvatar";

interface AdminNavbarProps {
  userName?: string;
  role?: string;
  cartCount?: number;
}

export default function AdminNavbar({
  userName = "Ozone",
  role = "Admin",
  cartCount = 9,
}: AdminNavbarProps) {
  return (
    <div className="bg-[#F5C518] px-4 py-2 flex items-center gap-4 h-14 shadow-sm">
      {/* Sidebar Toggle */}
      <button className="text-gray-800 text-xl font-bold w-8 hover:bg-black/5 rounded-lg transition">
        ☰
      </button>

      {/* Right side items */}
      <div className="ml-auto flex items-center gap-5 text-gray-800 font-medium">
        {/* Open Shop Icon */}
        <button
          className="flex flex-col items-center hover:scale-110 transition p-1"
          title="Go to Shop"
        >
          <span className="text-xl">🏠</span>
        </button>

        {/* My Cart Icon with dynamic badge */}
        <Link
          href="/cart"
          className="flex flex-col items-center relative hover:scale-110 transition p-1"
          title="My Cart"
        >
          <span className="text-xl">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-1 bg-orange-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold shadow-sm">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>

        {/* Admin Profile Section */}
        <button className="flex items-center gap-2 pl-2 border-l border-black/10 hover:opacity-80 transition">
          {/* เรียกใช้ Component ที่เราสร้างแทนรูปภาพ */}
          <UserAvatar name={userName} />

          <div className="flex flex-col items-start leading-none">
            <span className="text-xs font-bold text-black/60 uppercase">
              [{role}]
            </span>
            <span className="text-sm font-semibold">{userName}</span>
          </div>
        </button>
      </div>
    </div>
  );
}
