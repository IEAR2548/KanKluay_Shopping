// "use client";

// import Link from "next/link";
// import UserAvatar from "../user/UserAvatar";

// interface AdminNavbarProps {
//   userName?: string;
//   role?: string;
//   cartCount?: number;
// }

// export default function AdminNavbar({
//   userName = "Ozone",
//   role = "Admin",
// }: AdminNavbarProps) {
//   return (
//     <div className="bg-[#F5C518] px-4 py-2 flex items-center gap-4 h-14 shadow-sm">

//       {/* Right side items */}
//       <div className="ml-auto flex items-center gap-5 text-gray-800 font-medium">
//         {/* Open Shop Icon */}
//         <Link
//           href="/"
//           className="flex flex-col items-center hover:scale-110 transition p-1"
//           title="Go to Shop"
//         >
//           <span className="text-xl">🏠</span>
//         </Link>

//         {/* Admin Profile Section */}
//         <Link
//           href="/profile"
//           className="flex items-center gap-2 pl-2 border-l border-black/10 hover:opacity-80 transition"
//         >
//           {/* เรียกใช้ Component ที่เราสร้างแทนรูปภาพ */}
//           <UserAvatar name={userName} />

//           <div className="flex flex-col items-start leading-none">
//             <span className="text-xs font-bold text-black/60 uppercase">
//               [{role}]
//             </span>
//             <span className="text-sm font-semibold">{userName}</span>
//           </div>
//         </Link>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import UserAvatar from "../user/UserAvatar";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function AdminNavbar() {
  const { user, loading } = useCurrentUser();

  const displayName = loading ? "..." : user ? `${user.firstname} ${user.lastname}` : "Admin";
  const displayRole = loading ? "..." : user?.role ?? "admin";

  return (
    <div className="bg-[#F5C518] px-4 py-2 flex items-center gap-4 h-14 shadow-sm">
      <div className="ml-auto flex items-center gap-5 text-gray-800 font-medium">
        {/* Go to Shop */}
        <Link href="/" className="flex flex-col items-center hover:scale-110 transition p-1" title="Go to Shop">
          <span className="text-xl">🏠</span>
        </Link>

        {/* Admin Profile */}
        <Link
          href="/profile"
          className="flex items-center gap-2 pl-2 border-l border-black/10 hover:opacity-80 transition"
        >
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-yellow-300 animate-pulse" />
          ) : (
            <UserAvatar name={displayName} />
          )}

          <div className="flex flex-col items-start leading-none">
            <span className="text-xs font-bold text-black/60 uppercase">
              [{displayRole}]
            </span>
            <span className="text-sm font-semibold">{displayName}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}