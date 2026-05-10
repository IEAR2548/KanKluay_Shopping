const inventoryService = require('../services/inventoryService');

// GET /inventory
async function getAllInventory(req, res, next) {
  try {
    const data = await inventoryService.getAllInventory();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// GET /inventory/:productId
async function getInventoryByProduct(req, res, next) {
  try {
    const { productId } = req.params;
    const data = await inventoryService.getInventoryByProduct(productId);
    res.json({ data });
  } catch (err) {
    if (err.message.includes('ไม่พบ')) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

// GET /inventory/shop/:shopId
async function getInventoryByShop(req, res, next) {
  try {
    const { shopId } = req.params;
    const data = await inventoryService.getInventoryByShop(shopId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// PUT /inventory/:productId
// body: { quantity }
async function setQuantity(req, res, next) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: 'กรุณาระบุ quantity' });
    }

    const data = await inventoryService.setQuantity(productId, quantity);
    res.json({ data });
  } catch (err) {
    if (err.message.includes('ไม่พบ') || err.message.includes('ติดลบ')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

// PUT /inventory/:productId/add
// body: { amount }
async function addStock(req, res, next) {
  try {
    const { productId } = req.params;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'กรุณาระบุ amount' });
    }

    const data = await inventoryService.addStock(productId, amount);
    res.json({ data });
  } catch (err) {
    if (err.message.includes('ไม่พบ') || err.message.includes('มากกว่า 0')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

// PUT /inventory/:productId/subtract
// body: { amount }
async function subtractStock(req, res, next) {
  try {
    const { productId } = req.params;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'กรุณาระบุ amount' });
    }

    const data = await inventoryService.subtractStock(productId, amount);
    res.json({ data });
  } catch (err) {
    if (
      err.message.includes('ไม่พบ') ||
      err.message.includes('มากกว่า 0') ||
      err.message.includes('ไม่เพียงพอ')
    ) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  getAllInventory,
  getInventoryByProduct,
  getInventoryByShop,
  setQuantity,
  addStock,
  subtractStock,
};