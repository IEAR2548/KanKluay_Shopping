// 'use client';

// import { useState, useEffect } from 'react';
// import Table from '@/components/ui/Table';
// import Button from '@/components/ui/Button';
// import Modal from '@/components/ui/Modal';
// import {
//   fetchAllProducts,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// } from '@/lib/api/products';
// import {
//   fetchAllLocalCategories,
//   fetchLocalCategoriesByShop,
// } from '@/lib/api/categories';
// import { fetchAllShops, Shop } from '@/lib/api/shops';

// interface Product {
//   product_id: number;
//   shop_id: number;
//   shop_name: string;
//   local_cat_id: number;
//   category_name: string;
//   product_name: string;
//   description?: string;
//   price: number;
//   quantity: number;
// }

// interface LocalCategory {
//   local_cat_id: number;
//   shop_id: number;
//   category_name: string;
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [shops, setShops] = useState<Shop[]>([]);
//   const [categories, setCategories] = useState<LocalCategory[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [formData, setFormData] = useState({
//     shop_id: '',
//     local_cat_id: '',
//     product_name: '',
//     description: '',
//     price: '',
//     quantity: '',
//   });

//   // Load products, shops and categories
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setIsLoading(true);
//         const [productsData, shopsData, categoriesData] = await Promise.all([
//           fetchAllProducts(),
//           fetchAllShops(),
//           fetchAllLocalCategories(),
//         ]);
//         setProducts(productsData);
//         setShops(shopsData);
//         setCategories(categoriesData);
//       } catch (error) {
//         console.error('Error loading data:', error);
//         alert('Failed to load data');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const handleOpenModal = (product?: Product) => {
//     if (product) {
//       setEditingProduct(product);
//       setFormData({
//         shop_id: product.shop_id.toString(),
//         local_cat_id: product.local_cat_id.toString(),
//         product_name: product.product_name,
//         description: product.description || '',
//         price: product.price.toString(),
//         quantity: product.quantity.toString(),
//       });
//     } else {
//       setEditingProduct(null);
//       setFormData({
//         shop_id: '',
//         local_cat_id: '',
//         product_name: '',
//         description: '',
//         price: '',
//         quantity: '',
//       });
//     }
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setEditingProduct(null);
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     const updated = { ...formData, [name]: value };
    
//     // When shop changes, reset category and filter available categories
//     if (name === 'shop_id' && value) {
//       updated.local_cat_id = '';
//     }
    
//     setFormData(updated);
//   };

//   const handleSubmit = async () => {
//     try {
//       if (editingProduct) {
//         // Update product
//         await updateProduct(editingProduct.product_id, {
//           product_name: formData.product_name,
//           description: formData.description,
//           price: parseFloat(formData.price),
//         });
//         alert('Product updated successfully');
//       } else {
//         // Create product
//         await createProduct({
//           shop_id: parseInt(formData.shop_id),
//           local_cat_id: parseInt(formData.local_cat_id),
//           product_name: formData.product_name,
//           description: formData.description,
//           price: parseFloat(formData.price),
//           quantity: parseInt(formData.quantity),
//         });
//         alert('Product created successfully');
//       }

//       // Reload products
//       const productsData = await fetchAllProducts();
//       setProducts(productsData);
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving product:', error);
//       alert('Failed to save product');
//     }
//   };

//   const handleDelete = async (productId: number) => {
//     if (!window.confirm('Are you sure you want to delete this product?')) return;

//     try {
//       await deleteProduct(productId);
//       alert('Product deleted successfully');
//       const productsData = await fetchAllProducts();
//       setProducts(productsData);
//     } catch (error) {
//       console.error('Error deleting product:', error);
//       alert('Failed to delete product');
//     }
//   };

//   const columns = [
//     { key: 'product_id', label: 'ID' },
//     { key: 'product_name', label: 'Product Name' },
//     { key: 'shop_name', label: 'Shop' },
//     { key: 'category_name', label: 'Category' },
//     { key: 'price', label: 'Price', render: (value: any) => `$${(parseFloat(value) || 0).toFixed(2)}` },
//     { key: 'quantity', label: 'Quantity' },
//     {
//       key: 'actions',
//       label: 'Actions',
//       render: (_, row: Product) => (
//         <div className="flex gap-2">
//           <Button
//             variant="secondary"
//             onClick={() => handleOpenModal(row)}
//             className="!px-2 !py-1 text-sm"
//           >
//             Edit
//           </Button>
//           <Button
//             variant="danger"
//             onClick={() => handleDelete(row.product_id)}
//             className="!px-2 !py-1 text-sm"
//           >
//             Delete
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Products</h1>
//         <Button variant="primary" onClick={() => handleOpenModal()}>
//           Add Product
//         </Button>
//       </div>

//       <Table columns={columns} data={products} isLoading={isLoading} />

//       <Modal
//         isOpen={isModalOpen}
//         title={editingProduct ? 'Edit Product' : 'Add Product'}
//         onClose={handleCloseModal}
//         onSubmit={handleSubmit}
//         submitButtonText={editingProduct ? 'Update' : 'Create'}
//       >
//         <div className="space-y-4">
//           {!editingProduct && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium mb-1">Shop</label>
//                 <select
//                   name="shop_id"
//                   value={formData.shop_id}
//                   onChange={handleInputChange}
//                   className="w-full border border-gray-300 rounded px-3 py-2"
//                   required
//                 >
//                   <option value="">Select a shop</option>
//                   {shops.map((shop) => (
//                     <option key={shop.shop_id} value={shop.shop_id}>
//                       {shop.shop_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Category</label>
//                 <select
//                   name="local_cat_id"
//                   value={formData.local_cat_id}
//                   onChange={handleInputChange}
//                   className="w-full border border-gray-300 rounded px-3 py-2"
//                   required
//                   disabled={!formData.shop_id}
//                 >
//                   <option value="">Select a category</option>
//                   {categories
//                     .filter(
//                       (cat) => !formData.shop_id || cat.shop_id === parseInt(formData.shop_id)
//                     )
//                     .map((cat) => (
//                       <option key={cat.local_cat_id} value={cat.local_cat_id}>
//                         {cat.category_name}
//                       </option>
//                     ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Quantity</label>
//                 <input
//                   type="number"
//                   name="quantity"
//                   value={formData.quantity}
//                   onChange={handleInputChange}
//                   placeholder="Product quantity"
//                   className="w-full border border-gray-300 rounded px-3 py-2"
//                   required
//                 />
//               </div>
//             </>
//           )}

//           <div>
//             <label className="block text-sm font-medium mb-1">Product Name</label>
//             <input
//               type="text"
//               name="product_name"
//               value={formData.product_name}
//               onChange={handleInputChange}
//               placeholder="Product name"
//               className="w-full border border-gray-300 rounded px-3 py-2"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Description</label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleInputChange}
//               placeholder="Product description"
//               rows={3}
//               className="w-full border border-gray-300 rounded px-3 py-2"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Price</label>
//             <input
//               type="number"
//               name="price"
//               value={formData.price}
//               onChange={handleInputChange}
//               placeholder="Product price"
//               step="0.01"
//               className="w-full border border-gray-300 rounded px-3 py-2"
//               required
//             />
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }
