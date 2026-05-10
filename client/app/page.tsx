export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to KanKluay Shopping</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your premier e-commerce platform for quality products and services
        </p>
        <div className="space-x-4">
          <a
            href="/products"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </a>
          <a
            href="/shops"
            className="inline-block px-6 py-3 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
          >
            View Shops
          </a>
        </div>
      </div>
    </div>
  );
}
