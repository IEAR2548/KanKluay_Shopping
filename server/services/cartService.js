const db = require('../db');

// ────────────────────────────────────────────────────────────
//  Helper: ดึงหรือสร้าง cart ของ user (1 user = 1 cart)
// ────────────────────────────────────────────────────────────
async function getOrCreateCart(userId) {
  let result = await db.query(
    'SELECT cart_id FROM Cart WHERE user_id = $1',
    [userId]
  );
  if (result.rows.length > 0) return result.rows[0].cart_id;

  result = await db.query(
    'INSERT INTO Cart (user_id) VALUES ($1) RETURNING cart_id',
    [userId]
  );
  return result.rows[0].cart_id;
}

// ────────────────────────────────────────────────────────────
//  GET cart ของ user พร้อมรายการสินค้าและราคารวม
// ────────────────────────────────────────────────────────────
async function getCart(userId) {
  const cartId = await getOrCreateCart(userId);

  const result = await db.query(
    `SELECT
       ci.product_id,
       p.product_name,
       p.price,
       p.image_url,
       p.shop_id,
       s.shop_name,
       ci.quantity,
       (p.price * ci.quantity) AS subtotal,
       inv.quantity            AS stock_available
     FROM Cart_Item ci
     JOIN Product   p   ON p.product_id   = ci.product_id
     JOIN Shop      s   ON s.shop_id      = p.shop_id
     JOIN Inventory inv ON inv.product_id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.product_id`,
    [cartId]
  );

  const items = result.rows;
  const total_amount = items.reduce(
    (sum, item) => sum + parseFloat(item.subtotal), 0
  );

  return { cart_id: cartId, items, total_amount };
}

// ────────────────────────────────────────────────────────────
//  POST เพิ่มสินค้าเข้า cart (ถ้ามีอยู่แล้ว → บวก quantity)
// ────────────────────────────────────────────────────────────
async function addItem(userId, productId, quantity) {
  const stockResult = await db.query(
    'SELECT quantity FROM Inventory WHERE product_id = $1',
    [productId]
  );
  if (stockResult.rows.length === 0) throw new Error('ไม่พบสินค้านี้');

  const cartId = await getOrCreateCart(userId);

  // ดึงของที่อยู่ใน cart อยู่แล้ว
  const cartItem = await db.query(
    'SELECT quantity FROM Cart_Item WHERE cart_id = $1 AND product_id = $2',
    [cartId, productId]
  );
  const alreadyInCart = cartItem.rows[0]?.quantity || 0;

  // เช็ครวม: ของในคลัง >= ของใน cart + ที่จะเพิ่มใหม่
  if (stockResult.rows[0].quantity < alreadyInCart + quantity) {
    throw new Error('สินค้าในสต็อกไม่เพียงพอ');
  }

  await db.query(
    `INSERT INTO Cart_Item (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = Cart_Item.quantity + EXCLUDED.quantity`,
    [cartId, productId, quantity]
  );

  return getCart(userId);
}

// ────────────────────────────────────────────────────────────
//  PUT เปลี่ยน quantity ของสินค้าใน cart
// ────────────────────────────────────────────────────────────
async function updateItem(userId, productId, quantity) {
  if (quantity <= 0) throw new Error('quantity ต้องมากกว่า 0');

  const stockResult = await db.query(
    'SELECT quantity FROM Inventory WHERE product_id = $1',
    [productId]
  );
  if (stockResult.rows.length === 0) throw new Error('ไม่พบสินค้านี้');
  if (stockResult.rows[0].quantity < quantity) throw new Error('สินค้าในสต็อกไม่เพียงพอ');

  const cartId = await getOrCreateCart(userId);

  const result = await db.query(
    `UPDATE Cart_Item SET quantity = $1
     WHERE cart_id = $2 AND product_id = $3
     RETURNING *`,
    [quantity, cartId, productId]
  );
  if (result.rows.length === 0) throw new Error('ไม่พบสินค้านี้ใน cart');

  return getCart(userId);
}

// ────────────────────────────────────────────────────────────
//  DELETE ลบสินค้าชิ้นนั้นออกจาก cart
// ────────────────────────────────────────────────────────────
async function removeItem(userId, productId) {
  const cartId = await getOrCreateCart(userId);

  const result = await db.query(
    'DELETE FROM Cart_Item WHERE cart_id = $1 AND product_id = $2 RETURNING *',
    [cartId, productId]
  );
  if (result.rows.length === 0) throw new Error('ไม่พบสินค้านี้ใน cart');

  return getCart(userId);
}

// ────────────────────────────────────────────────────────────
//  DELETE ล้าง cart ทั้งหมด
// ────────────────────────────────────────────────────────────
async function clearCart(userId) {
  const cartId = await getOrCreateCart(userId);
  await db.query('DELETE FROM Cart_Item WHERE cart_id = $1', [cartId]);
  return { cart_id: cartId, items: [], total_amount: 0 };
}

// ────────────────────────────────────────────────────────────
//  POST checkout: เรียก orderService.createOrder แล้วล้าง cart
// ────────────────────────────────────────────────────────────
async function checkout(userId, addressId, paymentMethod, selectedProductIds = null) {
  // require ตรงนี้เพื่อหลีกเลี่ยง circular dependency
  const orderService = require('./orderService');

  const cartId = await getOrCreateCart(userId);

  // ดึงเฉพาะสินค้าที่เลือก (ถ้าส่ง product_ids มา) หรือทั้งหมด
  const itemsResult = selectedProductIds && selectedProductIds.length > 0
    ? await db.query(
        `SELECT ci.product_id, ci.quantity, p.shop_id
         FROM Cart_Item ci
         JOIN Product p ON p.product_id = ci.product_id
         WHERE ci.cart_id = $1 AND ci.product_id = ANY($2)`,
        [cartId, selectedProductIds]
      )
    : await db.query(
        `SELECT ci.product_id, ci.quantity, p.shop_id
         FROM Cart_Item ci
         JOIN Product p ON p.product_id = ci.product_id
         WHERE ci.cart_id = $1`,
        [cartId]
      );

  const items = itemsResult.rows;
  if (items.length === 0) throw new Error('Cart ว่างเปล่า ไม่สามารถ checkout ได้');

  // ตรวจว่าสินค้าทุกชิ้นมาจากร้านเดียวกัน
  const shopIds = [...new Set(items.map((i) => i.shop_id))];
  if (shopIds.length > 1) {
    throw new Error('สินค้าใน cart มาจากหลายร้าน กรุณาแยก checkout ทีละร้าน');
  }
  const shopId = shopIds[0];

  // แปลง format ให้ตรงกับที่ orderService.createOrder รับ
  const orderItems = items.map((i) => ({
    product_id: i.product_id,
    quantity:   i.quantity,
  }));

  // เรียก createOrder ของคน 2 — จัดการ stock, Order, Order_Item, Shop_Payout ทั้งหมดแล้ว
  const order = await orderService.createOrder(
    userId, shopId, addressId, paymentMethod, orderItems
  );

  // ลบเฉพาะสินค้าที่ checkout ออกจาก cart (ไม่ล้างทั้งหมด)
  const productIds = orderItems.map((i) => i.product_id);
  await db.query(
    'DELETE FROM Cart_Item WHERE cart_id = $1 AND product_id = ANY($2)',
    [cartId, productIds]
  );

  return {
    order_id:     order.order_id,
    total_amount: order.total_amount,
    net_amount:   order.net_amount,
  };
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, checkout };