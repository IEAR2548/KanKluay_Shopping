'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Report', href: '/admin/reports' },
    { name: 'User Management', href: '/admin/users' },
    { name: 'Shop Management', href: '/admin/shops' },
    { name: 'Order Management', href: '/admin/orders' },
    { name: 'Product Management', href: '/admin/products' },
  ];

  return (
    <aside className="w-64 bg-[#374151] text-white flex flex-col min-h-screen shrink-0">
      <div className="p-6 flex flex-col items-center border-b border-gray-600">
        <div className="bg-white rounded-lg p-2 w-full flex items-center justify-center mb-2 shadow-sm">
          <Logo width={160} height={50} />
        </div>
        <div className="text-xs text-gray-300 mt-2 font-light">Administrator Menu</div>
      </div>
      
      <nav className="flex-1 py-6 px-4">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`block px-4 py-3 rounded-md font-medium transition-colors ${
                    isActive 
                      ? 'text-yellow-400 bg-gray-700' 
                      : 'text-white hover:bg-gray-700 hover:text-gray-200'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
