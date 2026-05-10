const db = require('../db');

// ────────────────────────────────────────────────────────────
//  Helper: ดึงหรือสร้าง cart ของ user (1 user = 1 cart)
// ────────────────────────────────────────────────────────────
async function getOrCreateCart(userId) {
  // หา cart ที่มีอยู่แล้ว
  let result = await db.query(
    'SELECT cart_id FROM Cart WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length > 0) {
    return result.rows[0].cart_id;
  }

  // ยังไม่มี → สร้างใหม่
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
       ci.quantity,
       (p.price * ci.quantity) AS subtotal,
       inv.quantity            AS stock_available
     FROM Cart_Item ci
     JOIN Product   p   ON p.product_id   = ci.product_id
     JOIN Inventory inv ON inv.product_id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.product_id`,
    [cartId]
  );

  const items = result.rows;
  const total_amount = items.reduce(
    (sum, item) => sum + parseFloat(item.subtotal),
    0
  );

  return { cart_id: cartId, items, total_amount };
}

// ────────────────────────────────────────────────────────────
//  POST เพิ่มสินค้าเข้า cart (ถ้ามีอยู่แล้ว → บวก quantity)
// ────────────────────────────────────────────────────────────
async function addItem(userId, productId, quantity) {
  // ตรวจสอบว่าสินค้ามีอยู่และ stock พอ
  const stockResult = await db.query(
    'SELECT quantity FROM Inventory WHERE product_id = $1',
    [productId]
  );
  if (stockResult.rows.length === 0) {
    throw new Error('ไม่พบสินค้านี้');
  }
  if (stockResult.rows[0].quantity < quantity) {
    throw new Error('สินค้าในสต็อกไม่เพียงพอ');
  }

  const cartId = await getOrCreateCart(userId);

  // INSERT หรือ UPDATE ถ้ามีอยู่แล้ว
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
  if (quantity <= 0) {
    throw new Error('quantity ต้องมากกว่า 0');
  }

  // ตรวจ stock
  const stockResult = await db.query(
    'SELECT quantity FROM Inventory WHERE product_id = $1',
    [productId]
  );
  if (stockResult.rows.length === 0) {
    throw new Error('ไม่พบสินค้านี้');
  }
  if (stockResult.rows[0].quantity < quantity) {
    throw new Error('สินค้าในสต็อกไม่เพียงพอ');
  }

  const cartId = await getOrCreateCart(userId);

  const result = await db.query(
    `UPDATE Cart_Item SET quantity = $1
     WHERE cart_id = $2 AND product_id = $3
     RETURNING *`,
    [quantity, cartId, productId]
  );

  if (result.rows.length === 0) {
    throw new Error('ไม่พบสินค้านี้ใน cart');
  }

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

  if (result.rows.length === 0) {
    throw new Error('ไม่พบสินค้านี้ใน cart');
  }

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
//  POST checkout: สร้าง Order แล้วล้าง cart (ทำใน transaction)
// ────────────────────────────────────────────────────────────
async function checkout(userId, addressId, paymentMethod) {
  const cartId = await getOrCreateCart(userId);

  // ดึงรายการใน cart
  const itemsResult = await db.query(
    `SELECT ci.product_id, ci.quantity, p.price, p.shop_id
     FROM Cart_Item ci
     JOIN Product p ON p.product_id = ci.product_id
     WHERE ci.cart_id = $1`,
    [cartId]
  );

  const items = itemsResult.rows;
  if (items.length === 0) {
    throw new Error('Cart ว่างเปล่า ไม่สามารถ checkout ได้');
  }

  // ตรวจว่าสินค้าทุกชิ้นมาจากร้านเดียวกัน
  const shopIds = [...new Set(items.map((i) => i.shop_id))];
  if (shopIds.length > 1) {
    throw new Error('สินค้าใน cart มาจากหลายร้าน กรุณาแยก checkout ทีละร้าน');
  }
  const shopId = shopIds[0];

  const totalAmount = items.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.quantity,
    0
  );
  const platformFee = parseFloat((totalAmount * 0.06).toFixed(2)); // 6%
  const netAmount = parseFloat((totalAmount - platformFee).toFixed(2));

  // เริ่ม transaction
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. ตรวจและหัก stock ทุกรายการ
    for (const item of items) {
      const stockResult = await client.query(
        'SELECT quantity FROM Inventory WHERE product_id = $1 FOR UPDATE',
        [item.product_id]
      );
      if (stockResult.rows[0].quantity < item.quantity) {
        throw new Error(`สินค้า product_id ${item.product_id} มีสต็อกไม่เพียงพอ`);
      }
      await client.query(
        `UPDATE Inventory
         SET quantity = quantity - $1, last_updated = NOW()
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // 2. สร้าง Order
    const orderResult = await client.query(
      `INSERT INTO "Order"
         (user_id, shop_id, address_id, total_amount, net_amount, platform_fee,
          payment_method, payment_timestamp, shipping_status, order_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),'shipping','pending')
       RETURNING order_id`,
      [userId, shopId, addressId, totalAmount, netAmount, platformFee, paymentMethod]
    );
    const orderId = orderResult.rows[0].order_id;

    // 3. INSERT Order_Item
    for (const item of items) {
      await client.query(
        `INSERT INTO Order_Item (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // 4. สร้าง Shop_Payout
    await client.query(
      `INSERT INTO Shop_Payout (shop_id, order_id, net_amount, status)
       VALUES ($1, $2, $3, 'pending')`,
      [shopId, orderId, netAmount]
    );

    // 5. ล้าง cart
    await client.query('DELETE FROM Cart_Item WHERE cart_id = $1', [cartId]);

    await client.query('COMMIT');

    return { order_id: orderId, total_amount: totalAmount, net_amount: netAmount };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, checkout };