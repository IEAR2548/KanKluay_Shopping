const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// ⚠️ /inventory/shop/:shopId ต้องอยู่ก่อน /inventory/:productId
// เพราะ Express จะ match "shop" ว่าเป็น :productId ถ้าเรียงผิด

// GET    /inventory                        → ดู inventory ทั้งหมด
// GET    /inventory/shop/:shopId           → ดู inventory ของร้านนั้น
// GET    /inventory/:productId             → ดู inventory ของสินค้าชิ้นนั้น
// PUT    /inventory/:productId             → set quantity ตรงๆ
// PUT    /inventory/:productId/add         → เพิ่ม stock
// PUT    /inventory/:productId/subtract    → ลด stock

router.get('/',                         inventoryController.getAllInventory);
router.get('/shop/:shopId',             inventoryController.getInventoryByShop);
router.get('/:productId',               inventoryController.getInventoryByProduct);
router.put('/:productId',               inventoryController.setQuantity);
router.put('/:productId/add',           inventoryController.addStock);
router.put('/:productId/subtract',      inventoryController.subtractStock);

module.exports = router;