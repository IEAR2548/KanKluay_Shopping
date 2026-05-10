'use client';

export default function AdminNavbar() {
  return (
    <div className="bg-[#F5C518] px-4 py-2 flex items-center gap-4 h-14">
      <button className="text-gray-800 text-xl font-bold w-8">☰</button>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-5 text-gray-800 text-xs font-medium">
        {/* Open Shop */}
        <button className="flex flex-col items-center gap-0.5 hover:opacity-70 transition">
          <span className="text-lg">🏠</span>
          <span>Open Shop</span>
        </button>

        {/* My Cart */}
        <button className="flex flex-col items-center gap-0.5 hover:opacity-70 transition relative">
          <span className="text-lg">🛒</span>
          <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">9</span>
          <span>My Cart</span>
        </button>

        {/* Admin profile */}
        <button className="flex items-center gap-2 hover:opacity-70 transition">
          <img
            src="/logo.png"
            alt="Admin"
            className="w-8 h-8 rounded-full object-cover border-2 border-white"
          />
          <span className="font-semibold text-sm">[Admin] Ozone</span>
        </button>
      </div>
    </div>
  );
}