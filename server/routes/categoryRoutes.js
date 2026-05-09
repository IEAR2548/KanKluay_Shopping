const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// ==================== Global Category Routes ====================

// GET /categories/global - ดู global category ทั้งหมด
router.get('/global', categoryController.getAllGlobalCategories);

// POST /categories/global - เพิ่ม global category (body: category_name)
router.post('/global', categoryController.createGlobalCategory);

// DELETE /categories/global/:id - ลบ global category
router.delete('/global/:id', categoryController.deleteGlobalCategory);

// ==================== Local Category Routes ====================

// GET /categories/local - ดู local category ทั้งหมด
router.get('/local', categoryController.getAllLocalCategories);

// GET /categories/local/shop/:shopId - ดู local category ของร้านนั้น
router.get('/local/shop/:shopId', categoryController.getLocalCategoriesByShop);

// POST /categories/local - เพิ่ม local category (body: shop_id, global_cat_id, category_name)
router.post('/local', categoryController.createLocalCategory);

// DELETE /categories/local/:id - ลบ local category
router.delete('/local/:id', categoryController.deleteLocalCategory);

module.exports = router;
