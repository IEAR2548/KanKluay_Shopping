'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { fetchShopById, updateShop, Shop } from '@/lib/api/shops';

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = parseInt(params.id as string);

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_description: '',
  });

  useEffect(() => {
    loadShop();
  }, [shopId]);

  const loadShop = async () => {
    try {
      setLoading(true);
      const data = await fetchShopById(shopId);
      setShop(data);
      setFormData({
        shop_name: data.shop_name,
        shop_description: data.shop_description,
      });
    } catch (error) {
      console.error('Failed to load shop:', error);
      alert('Failed to load shop');
      router.push('/shops');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.shop_name) {
      alert('Shop name is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateShop(shopId, formData);
      setShop({ ...shop!, ...formData });
      setIsEditing(false);
      alert('Shop updated successfully');
    } catch (error) {
      console.error('Failed to update shop:', error);
      alert('Failed to update shop');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!shop) return <div className="p-8">Shop not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="secondary" onClick={() => router.push('/shops')} className="mb-8">
          ← Back to Shops
        </Button>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">{shop.shop_name}</h1>
          </div>

          {!isEditing ? (
            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Owner</p>
                <p className="text-lg font-semibold">{shop.user_id}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Description</p>
                <p className="text-lg font-semibold">{shop.shop_description}</p>
              </div>
              {shop.created_at && (
                <div>
                  <p className="text-gray-600 text-sm">Created</p>
                  <p className="text-lg font-semibold">
                    {new Date(shop.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              <Button variant="primary" onClick={() => setIsEditing(true)}>
                Edit Shop
              </Button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                <input
                  type="text"
                  value={formData.shop_name}
                  onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.shop_description}
                  onChange={(e) => setFormData({ ...formData, shop_description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      shop_name: shop.shop_name,
                      shop_description: shop.shop_description,
                    });
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
