const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET    /cart/:userId               → ดู cart ทั้งหมด
// POST   /cart/:userId/items         → เพิ่มสินค้า
// PUT    /cart/:userId/items/:productId → เปลี่ยน quantity
// DELETE /cart/:userId/items/:productId → ลบสินค้าชิ้นนั้น
// DELETE /cart/:userId               → ล้าง cart ทั้งหมด
// POST   /cart/:userId/checkout      → checkout สร้าง order

router.get('/:userId',                      cartController.getCart);
router.post('/:userId/items',               cartController.addItem);
router.put('/:userId/items/:productId',     cartController.updateItem);
router.delete('/:userId/items/:productId',  cartController.removeItem);
router.delete('/:userId',                   cartController.clearCart);
router.post('/:userId/checkout',            cartController.checkout);

module.exports = router;