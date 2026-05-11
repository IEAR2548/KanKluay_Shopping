import UserNavbar from '@/components/layout/UserNavbar';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <UserNavbar />
      <main className="max-w-5xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}