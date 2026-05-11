'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { fetchProductById, updateProduct } from '@/lib/api/products';

interface Product {
  product_id: number;
  shop_id: number;
  shop_name: string;
  local_cat_id: number;
  category_name: string;
  product_name: string;
  description?: string;
  price: number;
  quantity: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
  });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProductById(params.id as string);
        setProduct(data);
        setFormData({
          product_name: data.product_name,
          description: data.description || '',
          price: data.price.toString(),
        });
      } catch (error) {
        console.error('Error loading product:', error);
        alert('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!product) return;

      await updateProduct(product.product_id, {
        product_name: formData.product_name,
        description: formData.description,
        price: parseFloat(formData.price),
      });

      alert('Product updated successfully');
      
      // Reload product data
      const updatedProduct = await fetchProductById(params.id as string);
      setProduct(updatedProduct);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Product not found</p>
        <Button variant="primary" onClick={() => router.push('/products')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="secondary"
        onClick={() => router.push('/products')}
        className="mb-6"
      >
        Back to Products
      </Button>

      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
        {!isEditing ? (
          <div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">{product.product_name}</h1>
              <p className="text-gray-600 text-lg mb-4">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm">Shop</p>
                <p className="text-lg font-semibold">{product.shop_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Category</p>
                <p className="text-lg font-semibold">{product.category_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Price</p>
                <p className="text-lg font-semibold text-blue-600">${(parseFloat(product.price as any) || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Stock</p>
                <p className="text-lg font-semibold">{product.quantity} units</p>
              </div>
            </div>

            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Product
            </Button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Edit Product</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex gap-4">
                <Button variant="primary" onClick={handleSubmit}>
                  Save Changes
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
