'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function ShopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');

  const MENU = [
    { label: '📊 Dashboard', href: '/shop/dashboard' },
    { label: '📦 Products', href: '/shop/product' },
    { label: '🧾 Orders', href: '/shop/orders' },
  ];

  const navigate = (href: string) => {
    const url = shopId ? `${href}?shopId=${shopId}` : href;
    router.push(url);
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.sellerMenu}>Seller Menu</div>
      {MENU.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <div
            key={item.href}
            style={{ 
              ...styles.sidebarItem, 
              ...(isActive ? styles.sidebarActive : {}) 
            }}
            onClick={() => navigate(item.href)}
          >
            {item.label}
          </div>
        );
      })}
      
      <div className="mt-auto p-4">
        <Link 
          href="/"
          className="block text-xs text-gray-400 hover:text-white transition text-center border border-gray-600 rounded py-1"
        >
          Back to Shopping
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: { 
    width: 180, 
    background: "#3d2b00", 
    padding: 0, 
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  sellerMenu: {
    color: "#f5a623", 
    fontWeight: 700, 
    fontSize: 13,
    padding: "16px 20px", 
    borderBottom: "1px solid #5a4010",
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  sidebarItem: { 
    padding: "14px 20px", 
    color: "#ccc", 
    fontSize: 14, 
    cursor: "pointer",
    transition: 'all 0.2s',
  },
  sidebarActive: { 
    background: "#f5a623", 
    color: "#3d2b00", 
    fontWeight: 700 
  },
};
