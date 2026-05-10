// const cartService = require('../services/cartService');

// // GET /cart/:userId
// async function getCart(req, res, next) {
//   try {
//     const { userId } = req.params;
//     const data = await cartService.getCart(userId);
//     res.json({ data });
//   } catch (err) {
//     next(err);
//   }
// }

// // POST /cart/:userId/items
// // body: { product_id, quantity }
// async function addItem(req, res, next) {
//   try {
//     const { userId } = req.params;
//     const { product_id, quantity = 1 } = req.body;

//     if (!product_id) {
//       return res.status(400).json({ error: 'กรุณาระบุ product_id' });
//     }

//     const data = await cartService.addItem(userId, product_id, quantity);
//     res.status(201).json({ data });
//   } catch (err) {
//     if (err.message.includes('สต็อก') || err.message.includes('ไม่พบ')) {
//       return res.status(400).json({ error: err.message });
//     }
//     next(err);
//   }
// }

// // PUT /cart/:userId/items/:productId
// // body: { quantity }
// async function updateItem(req, res, next) {
//   try {
//     const { userId, productId } = req.params;
//     const { quantity } = req.body;

//     if (!quantity) {
//       return res.status(400).json({ error: 'กรุณาระบุ quantity' });
//     }

//     const data = await cartService.updateItem(userId, productId, quantity);
//     res.json({ data });
//   } catch (err) {
//     if (err.message.includes('สต็อก') || err.message.includes('ไม่พบ')) {
//       return res.status(400).json({ error: err.message });
//     }
//     next(err);
//   }
// }

// // DELETE /cart/:userId/items/:productId
// async function removeItem(req, res, next) {
//   try {
//     const { userId, productId } = req.params;
//     const data = await cartService.removeItem(userId, productId);
//     res.json({ data });
//   } catch (err) {
//     if (err.message.includes('ไม่พบ')) {
//       return res.status(404).json({ error: err.message });
//     }
//     next(err);
//   }
// }

// // DELETE /cart/:userId
// async function clearCart(req, res, next) {
//   try {
//     const { userId } = req.params;
//     const data = await cartService.clearCart(userId);
//     res.json({ data });
//   } catch (err) {
//     next(err);
//   }
// }

// // POST /cart/:userId/checkout
// // body: { address_id, payment_method }
// async function checkout(req, res, next) {
//   try {
//     const { userId } = req.params;
//     const { address_id, payment_method } = req.body;

//     if (!address_id || !payment_method) {
//       return res.status(400).json({ error: 'กรุณาระบุ address_id และ payment_method' });
//     }

//     const data = await cartService.checkout(userId, address_id, payment_method);
//     res.status(201).json({ data });
//   } catch (err) {
//     if (
//       err.message.includes('ว่างเปล่า') ||
//       err.message.includes('สต็อก') ||
//       err.message.includes('หลายร้าน')
//     ) {
//       return res.status(400).json({ error: err.message });
//     }
//     next(err);
//   }
// }

// module.exports = { getCart, addItem, updateItem, removeItem, clearCart, checkout };


const cartService = require('../services/cartService');

// GET /cart/:userId
async function getCart(req, res, next) {
  try {
    const { userId } = req.params;
    const data = await cartService.getCart(userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// POST /cart/:userId/items
// body: { product_id, quantity }
async function addItem(req, res, next) {
  try {
    const { userId } = req.params;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'กรุณาระบุ product_id' });
    }

    const data = await cartService.addItem(userId, product_id, quantity);
    res.status(201).json({ data });
  } catch (err) {
    if (err.message.includes('สต็อก') || err.message.includes('ไม่พบ')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

// PUT /cart/:userId/items/:productId
// body: { quantity }
async function updateItem(req, res, next) {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({ error: 'กรุณาระบุ quantity' });
    }

    const data = await cartService.updateItem(userId, productId, quantity);
    res.json({ data });
  } catch (err) {
    if (err.message.includes('สต็อก') || err.message.includes('ไม่พบ')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

// DELETE /cart/:userId/items/:productId
async function removeItem(req, res, next) {
  try {
    const { userId, productId } = req.params;
    const data = await cartService.removeItem(userId, productId);
    res.json({ data });
  } catch (err) {
    if (err.message.includes('ไม่พบ')) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

// DELETE /cart/:userId
async function clearCart(req, res, next) {
  try {
    const { userId } = req.params;
    const data = await cartService.clearCart(userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// POST /cart/:userId/checkout
// body: { address_id, payment_method, product_ids }
async function checkout(req, res, next) {
  try {
    const { userId } = req.params;
    const { address_id, payment_method, product_ids } = req.body;

    if (!address_id || !payment_method) {
      return res.status(400).json({ error: 'กรุณาระบุ address_id และ payment_method' });
    }

    const data = await cartService.checkout(userId, address_id, payment_method, product_ids);
    res.status(201).json({ data });
  } catch (err) {
    if (
      err.message.includes('ว่างเปล่า') ||
      err.message.includes('สต็อก') ||
      err.message.includes('หลายร้าน')
    ) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, checkout };