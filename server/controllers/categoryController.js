const categoryService = require('../services/categoryService');

// ==================== Global Category Controller ====================

const getAllGlobalCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllGlobalCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

const createGlobalCategory = async (req, res, next) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      const error = new Error('category_name is required');
      error.status = 400;
      throw error;
    }

    const category = await categoryService.createGlobalCategory(category_name);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

const deleteGlobalCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.deleteGlobalCategory(id);
    if (!category) {
      const error = new Error('Global Category not found');
      error.status = 404;
      throw error;
    }
    res.json({ message: 'Global Category deleted successfully', category });
  } catch (err) {
    next(err);
  }
};

// ==================== Local Category Controller ====================

const getAllLocalCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllLocalCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

const getLocalCategoriesByShop = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const categories = await categoryService.getLocalCategoriesByShop(shopId);
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

const createLocalCategory = async (req, res, next) => {
  try {
    const { shop_id, global_cat_id, category_name } = req.body;

    if (!shop_id || !global_cat_id || !category_name) {
      const error = new Error('shop_id, global_cat_id, and category_name are required');
      error.status = 400;
      throw error;
    }

    const category = await categoryService.createLocalCategory(shop_id, global_cat_id, category_name);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

const deleteLocalCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.deleteLocalCategory(id);
    if (!category) {
      const error = new Error('Local Category not found');
      error.status = 404;
      throw error;
    }
    res.json({ message: 'Local Category deleted successfully', category });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllGlobalCategories,
  createGlobalCategory,
  deleteGlobalCategory,
  getAllLocalCategories,
  getLocalCategoriesByShop,
  createLocalCategory,
  deleteLocalCategory
};
