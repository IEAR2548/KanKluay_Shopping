'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  username: string;
  imageUrl?: string | null;
};

export default function ProfileSidebar({ username, imageUrl }: Props) {
  const pathname = usePathname();

  const initials = username?.slice(0, 2).toUpperCase() || 'U';

  const NAV = [
    {
      section: 'My Account',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      children: [
        { label: 'Record',  href: '/profile' },
        { label: 'Address', href: '/profile/address' },
      ],
    },
    {
      section: 'My Purchases',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      children: [
        { label: 'My Purchases', href: '/profile/purchases' },
      ],
    },
  ];

  return (
    <aside className="w-44 flex-shrink-0">
      {/* User info */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-teal-400 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
          {imageUrl ? (
            <img src={imageUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-sm">{initials}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{username}</p>
          <Link href="/profile" className="text-xs text-gray-500 hover:text-yellow-600 flex items-center gap-0.5 transition">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Personal Information
          </Link>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-1">
        {NAV.map(group => (
          <div key={group.section}>
            {/* Section header */}
            <div className={`flex items-center gap-2 py-2 font-semibold text-sm ${
              group.children.some(c => pathname === c.href)
                ? 'text-[#F5A623]'
                : 'text-gray-700'
            }`}>
              <span className="text-gray-500">{group.icon}</span>
              {group.children.length === 1
                ? (
                  <Link
                    href={group.children[0].href}
                    className={`${
                      pathname === group.children[0].href ? 'text-[#F5A623]' : 'text-gray-700 hover:text-gray-900'
                    } transition`}
                  >
                    {group.section}
                  </Link>
                )
                : <span>{group.section}</span>
              }
            </div>

            {/* Children (indent) */}
            {group.children.length > 1 && (
              <div className="ml-7 space-y-0.5">
                {group.children.map(child => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`block py-1.5 text-sm transition ${
                      pathname === child.href
                        ? 'text-[#F5A623] font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}