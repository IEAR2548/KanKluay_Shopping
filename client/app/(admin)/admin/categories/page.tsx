'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  fetchAllGlobalCategories,
  createGlobalCategory,
  deleteGlobalCategory,
  fetchAllLocalCategories,
  fetchLocalCategoriesByShop,
  createLocalCategory,
  deleteLocalCategory,
} from '@/lib/api/categories';
import { fetchAllShops, Shop } from '@/lib/api/shops';

interface GlobalCategory {
  global_category_id: number;
  category_name: string;
}

interface LocalCategory {
  local_category_id: number;
  shop_id: number;
  global_category_id: number;
  category_name: string;
  shop_name: string;
}

export default function CategoriesPage() {
  const [globalCategories, setGlobalCategories] = useState<GlobalCategory[]>([]);
  const [localCategories, setLocalCategories] = useState<LocalCategory[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'local'>('global');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    globalCategoryName: '',
    shopId: '',
    globalCategoryId: '',
    localCategoryName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [globalCats, localCats, shopsList] = await Promise.all([
        fetchAllGlobalCategories(),
        fetchAllLocalCategories(),
        fetchAllShops(),
      ]);
      setGlobalCategories(globalCats);
      setLocalCategories(localCats);
      setShops(shopsList);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGlobalCategory = async () => {
    if (!formData.globalCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    setIsSubmitting(true);
    try {
      await createGlobalCategory(formData.globalCategoryName);
      setFormData({ ...formData, globalCategoryName: '' });
      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add global category:', error);
      alert('Failed to add global category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGlobalCategory = async (id: number) => {
    if (!confirm('Delete this category?')) return;

    try {
      await deleteGlobalCategory(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete global category:', error);
      alert('Failed to delete global category');
    }
  };

  const handleAddLocalCategory = async () => {
    if (!formData.shopId || !formData.globalCategoryId || !formData.localCategoryName.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createLocalCategory({
        shop_id: parseInt(formData.shopId),
        global_category_id: parseInt(formData.globalCategoryId),
        category_name: formData.localCategoryName,
      });
      setFormData({ ...formData, shopId: '', globalCategoryId: '', localCategoryName: '' });
      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add local category:', error);
      alert('Failed to add local category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocalCategory = async (id: number) => {
    if (!confirm('Delete this category?')) return;

    try {
      await deleteLocalCategory(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete local category:', error);
      alert('Failed to delete local category');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'global'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Global Categories
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'local'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Local Categories
          </button>
        </div>

        {/* Global Categories Tab */}
        {activeTab === 'global' && (
          <div>
            <Button
              variant="primary"
              onClick={() => {
                setFormData({ ...formData, globalCategoryName: '' });
                setIsModalOpen(true);
              }}
              className="mb-4"
            >
              Add Global Category
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalCategories.map((cat) => (
                <div key={cat.global_category_id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-lg mb-2">{cat.category_name}</h3>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteGlobalCategory(cat.global_category_id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Local Categories Tab */}
        {activeTab === 'local' && (
          <div>
            <Button
              variant="primary"
              onClick={() => {
                setFormData({
                  ...formData,
                  shopId: '',
                  globalCategoryId: '',
                  localCategoryName: '',
                });
                setIsModalOpen(true);
              }}
              className="mb-4"
            >
              Add Local Category
            </Button>

            <div className="space-y-6">
              {shops.map((shop) => {
                const shopCategories = localCategories.filter(
                  (cat) => cat.shop_id === shop.shop_id
                );
                return shopCategories.length > 0 ? (
                  <div key={shop.shop_id} className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4">{shop.shop_name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shopCategories.map((cat) => (
                        <div
                          key={cat.local_category_id}
                          className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{cat.category_name}</p>
                            <p className="text-sm text-gray-600">
                              Based on: Global Category #{cat.global_category_id}
                            </p>
                          </div>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteLocalCategory(cat.local_category_id)}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          title={activeTab === 'global' ? 'Add Global Category' : 'Add Local Category'}
          onClose={() => setIsModalOpen(false)}
          onSubmit={
            activeTab === 'global' ? handleAddGlobalCategory : handleAddLocalCategory
          }
          isLoading={isSubmitting}
        >
          {activeTab === 'global' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                value={formData.globalCategoryName}
                onChange={(e) =>
                  setFormData({ ...formData, globalCategoryName: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                placeholder="Enter category name"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Shop</label>
                <select
                  value={formData.shopId}
                  onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="">Select a shop</option>
                  {shops.map((shop) => (
                    <option key={shop.shop_id} value={shop.shop_id}>
                      {shop.shop_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Global Category
                </label>
                <select
                  value={formData.globalCategoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, globalCategoryId: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="">Select a global category</option>
                  {globalCategories.map((cat) => (
                    <option key={cat.global_category_id} value={cat.global_category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Local Category Name
                </label>
                <input
                  type="text"
                  value={formData.localCategoryName}
                  onChange={(e) =>
                    setFormData({ ...formData, localCategoryName: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  placeholder="Enter local category name"
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
