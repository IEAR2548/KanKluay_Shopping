'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard',          href: '/admin/dashboard' },
  { label: 'Report',             href: '/admin/reports' },
  { label: 'User Management',    href: '/admin/users' },
  { label: 'Shop Management',    href: '/admin/shops' },
  { label: 'Order Management',   href: '/admin/orders' },
  { label: 'Product Management', href: '/admin/products' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-44 min-h-screen bg-[#3a3a3a] text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex flex-col items-center py-5 border-b border-gray-600">
        <img src="/logo.png" alt="KanKluay" className="w-20 h-20 object-contain" />
        <span className="text-xs text-gray-400 mt-1 font-medium">Administrator Menu</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col py-2">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-5 py-3 text-sm font-semibold transition-colors leading-tight ${
                isActive
                  ? 'text-[#F5C518]'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}