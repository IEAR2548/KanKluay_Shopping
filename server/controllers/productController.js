const productService = require("../services/productService");

const getAllProducts = async (req, res, next) => {
  try { 
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      throw error;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const getProductsByShop = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const products = await productService.getProductsByShop(shopId);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      shop_id,
      local_cat_id,
      product_name,
      description,
      price,
      quantity,
    } = req.body;

    if (
      !shop_id ||
      !local_cat_id ||
      !product_name ||
      !price ||
      quantity === undefined
    ) {
      const error = new Error(
        "shop_id, local_cat_id, product_name, price, and quantity are required",
      );
      error.status = 400;
      throw error;
    }

    const product = await productService.createProduct(
      shop_id,
      local_cat_id,
      product_name,
      description,
      price,
      quantity,
    );

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { product_name, description, price } = req.body;

    if (!product_name || !price) {
      const error = new Error("product_name and price are required");
      error.status = 400;
      throw error;
    }

    const product = await productService.updateProduct(
      id,
      product_name,
      description,
      price,
    );
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      throw error;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.deleteProduct(id);
    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      throw error;
    }
    res.json({ message: "Product deleted successfully", product });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByShop,
  createProduct,
  updateProduct,
  deleteProduct,
};
