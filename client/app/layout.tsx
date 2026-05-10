import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'KanKluay Shopping',
  description: 'E-Commerce platform for shopping',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
