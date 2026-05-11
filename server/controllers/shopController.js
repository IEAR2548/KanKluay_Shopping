// const shopService = require('../services/shopService');

// const getAllShops = async (req, res, next) => {
//   try {
//     const shops = await shopService.getAllShops();
//     res.json(shops);
//   } catch (err) {
//     next(err);
//   }
// };

// const getShopById = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const shop = await shopService.getShopById(id);
//     if (!shop) {
//       const error = new Error('Shop not found');
//       error.status = 404;
//       throw error;
//     }
//     res.json(shop);
//   } catch (err) {
//     next(err);
//   }
// };

// const createShop = async (req, res, next) => {
//   try {
//     const { user_id, shop_name, shop_description } = req.body;

//     if (!user_id || !shop_name) {
//       const error = new Error('user_id and shop_name are required');
//       error.status = 400;
//       throw error;
//     }

//     const shop = await shopService.createShop(user_id, shop_name, shop_description);
//     res.status(201).json(shop);
//   } catch (err) {
//     next(err);
//   }
// };

// const updateShop = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { shop_name, shop_description } = req.body;

//     if (!shop_name) {
//       const error = new Error('shop_name is required');
//       error.status = 400;
//       throw error;
//     }

//     const shop = await shopService.updateShop(id, shop_name, shop_description);
//     if (!shop) {
//       const error = new Error('Shop not found');
//       error.status = 404;
//       throw error;
//     }
//     res.json(shop);
//   } catch (err) {
//     next(err);
//   }
// };

// const deleteShop = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const shop = await shopService.deleteShop(id);
//     if (!shop) {
//       const error = new Error('Shop not found');
//       error.status = 404;
//       throw error;
//     }
//     res.json({ message: 'Shop deleted successfully', shop });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = {
//   getAllShops,
//   getShopById,
//   createShop,
//   updateShop,
//   deleteShop
// };

const shopService = require("../services/shopService");

const getAllShops = async (req, res, next) => {
  try {
    const shops = await shopService.getAllShops();
    res.json(shops);
  } catch (err) {
    next(err);
  }
};

const getShopById = async (req, res, next) => {
  try {
    const shop = await shopService.getShopById(req.params.id);
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    res.json(shop);
  } catch (err) {
    next(err);
  }
};

const createShop = async (req, res, next) => {
  try {
    const { user_id, shop_name, shop_description, logo_url } = req.body;
    if (!user_id || !shop_name)
      return res
        .status(400)
        .json({ error: "user_id and shop_name are required" });
    const shop = await shopService.createShop(
      user_id,
      shop_name,
      shop_description,
      logo_url,
    );
    res.status(201).json(shop);
  } catch (err) {
    next(err);
  }
};

const updateShop = async (req, res, next) => {
  try {
    const { shop_name, shop_description, logo_url, status } = req.body;
    if (!shop_name)
      return res.status(400).json({ error: "shop_name is required" });
    const shop = await shopService.updateShop(
      req.params.id,
      shop_name,
      shop_description,
      logo_url,
      status,
    );
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    res.json(shop);
  } catch (err) {
    next(err);
  }
};

const deleteShop = async (req, res, next) => {
  try {
    const shop = await shopService.deleteShop(req.params.id);
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    res.json({ message: "Shop deleted successfully", shop });
  } catch (err) {
    next(err);
  }
};

const getShopByUserId = async (req, res, next) => {
  try {
    const shops = await shopService.getShopByUserId(req.params.userId);
    res.json(shops);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllShops,
  getShopById,
  getShopByUserId,
  createShop,
  updateShop,
  deleteShop,
};
