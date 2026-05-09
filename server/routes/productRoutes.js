const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /products - ดูสินค้าทั้งหมด
router.get('/', productController.getAllProducts);

// GET /products/:id - ดูสินค้าชิ้นเดียว
router.get('/:id', productController.getProductById);

// GET /products/shop/:shopId - ดูสินค้าของร้านนั้น
router.get('/shop/:shopId', productController.getProductsByShop);

// POST /products - เพิ่มสินค้า + สร้าง Inventory
// body: shop_id, local_cat_id, product_name, description, price, quantity
router.post('/', productController.createProduct);

// PUT /products/:id - แก้ไขสินค้า
// body: product_name, description, price
router.put('/:id', productController.updateProduct);

// DELETE /products/:id - ลบสินค้า
router.delete('/:id', productController.deleteProduct);

module.exports = router;
