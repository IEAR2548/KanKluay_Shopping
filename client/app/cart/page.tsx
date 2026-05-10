'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface CartItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cart from localStorage
    setLoading(true);
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  const removeItem = (productId: number) => {
    const updatedCart = cartItems.filter((item) => item.product_id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item.product_id === productId ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/products">
              <Button variant="primary">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product_id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{item.product_name}</h3>
                    <p className="text-gray-600">${(parseFloat(item.price as any) || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-3 py-2 min-w-[50px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => removeItem(item.product_id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-6 border-b pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button variant="primary" className="w-full">
                Checkout
              </Button>
              <Link href="/products" className="block mt-2">
                <Button variant="secondary" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
