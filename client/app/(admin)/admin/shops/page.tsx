'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import { fetchAllShops, createShop, updateShop, deleteShop, Shop } from '@/lib/api/shops';

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    shop_name: '',
    shop_description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const data = await fetchAllShops();
      setShops(data);
    } catch (error) {
      console.error('Failed to load shops:', error);
      alert('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (shop?: Shop) => {
    if (shop) {
      setEditingShop(shop);
      setFormData({
        user_id: shop.user_id,
        shop_name: shop.shop_name,
        shop_description: shop.shop_description,
      });
    } else {
      setEditingShop(null);
      setFormData({
        user_id: '',
        shop_name: '',
        shop_description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShop(null);
  };

  const handleSubmit = async () => {
    if (!formData.user_id || !formData.shop_name) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingShop) {
        await updateShop(editingShop.shop_id, formData);
      } else {
        await createShop(formData);
      }
      await loadShops();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save shop:', error);
      alert('Failed to save shop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (shop: Shop) => {
    if (!confirm(`Delete shop "${shop.shop_name}"?`)) return;

    try {
      await deleteShop(shop.shop_id);
      await loadShops();
    } catch (error) {
      console.error('Failed to delete shop:', error);
      alert('Failed to delete shop');
    }
  };

  const columns = [
    { key: 'shop_id', label: 'ID' },
    { key: 'shop_name', label: 'Shop Name' },
    { key: 'shop_description', label: 'Description' },
    { key: 'user_id', label: 'Owner' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row: Shop) => (
        <div className="flex gap-2">
          <Link href={`/shops/${row.shop_id}`}>
            <Button variant="secondary">View</Button>
          </Link>
          <Button variant="secondary" onClick={() => handleOpenModal(row)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => handleDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shops</h1>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            Add New Shop
          </Button>
        </div>

        <Table columns={columns} data={shops} isLoading={loading} emptyMessage="No shops found" />

        <Modal
          isOpen={isModalOpen}
          title={editingShop ? 'Edit Shop' : 'Add New Shop'}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Owner ID</label>
              <input
                type="text"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                placeholder="Enter owner ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shop Name</label>
              <input
                type="text"
                value={formData.shop_name}
                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                placeholder="Enter shop name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.shop_description}
                onChange={(e) => setFormData({ ...formData, shop_description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                placeholder="Enter shop description"
                rows={4}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
