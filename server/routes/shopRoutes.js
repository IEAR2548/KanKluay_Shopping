const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

// GET /shops - ดูร้านทั้งหมด
router.get('/', shopController.getAllShops);

// GET /shops/:id - ดูร้านเดียว
router.get('/:id', shopController.getShopById);

// POST /shops - เพิ่มร้าน (body: user_id, shop_name, shop_description)
router.post('/', shopController.createShop);

// PUT /shops/:id - แก้ไขร้าน (body: shop_name, shop_description)
router.put('/:id', shopController.updateShop);

// DELETE /shops/:id - ลบร้าน
router.delete('/:id', shopController.deleteShop);

module.exports = router;
