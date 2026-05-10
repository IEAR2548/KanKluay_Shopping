'use client';

import { Menu, ShoppingCart, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function AdminNavbar() {
  return (
    <header className="h-16 bg-[#FCD34D] flex items-center justify-between px-6 shrink-0 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button className="text-gray-800 hover:text-gray-600">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm">
          <Logo width={100} height={30} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center cursor-pointer text-gray-800 hover:text-gray-600">
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium leading-none">Open Shop</span>
        </div>

        <Link href="/cart">
          <div className="flex flex-col items-center cursor-pointer text-gray-800 hover:text-gray-600 relative">
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-0.5" />
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full">
                15
              </span>
            </div>
            <span className="text-[10px] font-medium leading-none mt-1">My Cart</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 pl-4 border-l border-yellow-600/20 cursor-pointer">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-200 flex-shrink-0">
            {/* Avatar placeholder */}
            <div className="w-full h-full bg-gradient-to-tr from-cyan-400 to-blue-500"></div>
          </div>
          <span className="text-sm font-medium text-gray-800">[Admin] Ozone</span>
        </div>
      </div>
    </header>
  );
}
