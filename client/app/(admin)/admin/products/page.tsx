'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAllProducts, updateProduct, deleteProduct } from '@/lib/api/products';
import Modal from '@/components/ui/Modal';

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
  image_url?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ product_name: '', description: '', price: 0 });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchAllProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // filtering
  const filteredProducts = products.filter(product => {
    if (search.trim() === '') return true;
    const term = search.toLowerCase();
    return product.product_name.toLowerCase().includes(term) || 
           String(product.product_id).includes(term) ||
           (product.shop_name && product.shop_name.toLowerCase().includes(term));
  });

  // reset pagination on filter change
  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      product_name: product.product_name,
      description: product.description || '',
      price: Number(product.price) || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(productId);
      const data = await fetchAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to delete product", error);
      alert("Failed to delete product");
    }
  };

  const handleEditSubmit = async () => {
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct.product_id, editForm);
      const data = await fetchAllProducts();
      setProducts(data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update product", error);
      alert("Failed to update product");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Product Management</h1>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-end gap-4 border-b border-gray-100">
          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search Product" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-50/50"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#FEF3C7] text-gray-800 font-medium">
                <th className="py-3 px-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 w-4 h-4" />
                </th>
                <th className="py-3 px-4 w-16">No.</th>
                <th className="py-3 px-4 w-32">Product ID</th>
                <th className="py-3 px-4 min-w-[200px]">Product</th>
                <th className="py-3 px-4">Shop</th>
                <th className="py-3 px-4 w-24">Price</th>
                <th className="py-3 px-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">No products found.</td>
                </tr>
              ) : paginatedProducts.map((product, index) => (
                <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 w-4 h-4" />
                  </td>
                  <td className="py-4 px-4 text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="py-4 px-4 text-gray-600">{product.product_id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                        {product.image_url ? (
                          <img src={`http://localhost:5000${product.image_url}`} alt={product.product_name} className="w-full h-full object-cover rounded" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div>
                        <div className="text-gray-800 font-medium">{product.product_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{product.shop_name}</td>
                  <td className="py-4 px-4 text-gray-600">{Number(product.price).toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEditClick(product)} className="text-gray-600 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.product_id)} className="text-gray-600 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button 
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                  currentPage === pageNum 
                    ? 'bg-[#FCD34D] text-gray-800 font-medium' 
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {pageNum}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      <Modal
        isOpen={isEditModalOpen}
        title="Edit Product"
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        submitButtonText="Save Changes"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={editForm.product_name}
              onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (฿)</label>
            <input
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}
