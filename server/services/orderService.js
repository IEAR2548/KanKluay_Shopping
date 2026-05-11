const db = require('../db');

const PLATFORM_FEE_RATE = 0.06; // 6%

// Order

const getAllOrders = () =>
  db.query(`
    SELECT 
      o.*,
      u.firstname || ' ' || u.lastname AS customer_name,
      s.shop_name
    FROM "Order" o
    JOIN "User" u ON o.user_id  = u.user_id
    JOIN Shop   s ON o.shop_id  = s.shop_id
    ORDER BY o.order_date DESC
  `);

const getOrderById = async (id) => {
  const order = await db.query(`
    SELECT 
      o.*,
      u.firstname || ' ' || u.lastname AS customer_name,
      s.shop_name,
      a.recipient_name, a.phone_number AS address_phone, a.address_detail
    FROM "Order" o
    JOIN "User"        u ON o.user_id   = u.user_id
    JOIN Shop          s ON o.shop_id   = s.shop_id
    JOIN User_Address  a ON o.address_id = a.address_id
    WHERE o.order_id = $1
  `, [id]);

  const items = await db.query(`
    SELECT 
      oi.*,
      p.product_name,
      p.image_url
    FROM Order_Item oi
    JOIN Product p ON oi.product_id = p.product_id
    WHERE oi.order_id = $1
  `, [id]);

  return { order: order.rows[0], items: items.rows };
};

const getOrdersByUser = (user_id) =>
  db.query(`
    SELECT 
      o.*,
      s.shop_name
    FROM "Order" o
    JOIN Shop s ON o.shop_id = s.shop_id
    WHERE o.user_id = $1
    ORDER BY o.order_date DESC
  `, [user_id]);

const getOrdersByShop = (shop_id) =>
  db.query(`
    SELECT 
      o.*,
      u.firstname || ' ' || u.lastname AS customer_name
    FROM "Order" o
    JOIN "User" u ON o.user_id = u.user_id
    WHERE o.shop_id = $1
    ORDER BY o.order_date DESC
  `, [shop_id]);

// items = [{ product_id, quantity }, ...]
const createOrder = async (user_id, shop_id, address_id, payment_method, items) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. ดึงราคาและเช็ค inventory แต่ละ product
    for (const item of items) {
      const inv = await client.query(
        'SELECT quantity FROM Inventory WHERE product_id=$1', [item.product_id]
      );
      if (!inv.rows.length || inv.rows[0].quantity < item.quantity)
        throw new Error(`Product ${item.product_id} has insufficient stock`);
    }

    const productIds = items.map(i => i.product_id);
    const prices = await client.query(
      `SELECT product_id, price FROM Product WHERE product_id = ANY($1)`,
      [productIds]
    );
    const priceMap = {};
    prices.rows.forEach(p => priceMap[p.product_id] = parseFloat(p.price));

    // 2. คำนวณยอดเงิน
    let total_amount = 0;
    for (const item of items) {
      total_amount += priceMap[item.product_id] * item.quantity;
    }
    const platform_fee = parseFloat((total_amount * PLATFORM_FEE_RATE).toFixed(2));
    const net_amount   = parseFloat((total_amount - platform_fee).toFixed(2));

    // 3. INSERT Order
    const order = await client.query(`
      INSERT INTO "Order" 
        (user_id, shop_id, address_id, total_amount, net_amount, platform_fee,
         payment_method, payment_timestamp)
      VALUES ($1,$2,$3,$4,$5,$6,$7, NOW())
      RETURNING *
    `, [user_id, shop_id, address_id, total_amount, net_amount, platform_fee, payment_method]);

    const order_id = order.rows[0].order_id;

    // 4. INSERT Order_Item และ UPDATE Inventory
    for (const item of items) {
      await client.query(`
        INSERT INTO Order_Item (order_id, product_id, quantity, price_at_purchase)
        VALUES ($1,$2,$3,$4)
      `, [order_id, item.product_id, item.quantity, priceMap[item.product_id]]);

      await client.query(`
        UPDATE Inventory
        SET quantity = quantity - $1, last_updated = NOW()
        WHERE product_id = $2
      `, [item.quantity, item.product_id]);
    }

    await client.query('COMMIT');
    return order.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateOrderStatus = (id, order_status, shipping_status) =>
  db.query(`
    UPDATE "Order"
    SET order_status    = COALESCE($1, order_status),
        shipping_status = COALESCE($2, shipping_status)
    WHERE order_id = $3
    RETURNING order_id, order_status, shipping_status
  `, [order_status || null, shipping_status || null, id]);

const deleteOrder = (id) =>
  db.query(`DELETE FROM "Order" WHERE order_id=$1 RETURNING order_id`, [id]);

module.exports = {
  getAllOrders, getOrderById, getOrdersByUser, getOrdersByShop,
  createOrder, updateOrderStatus, deleteOrder,
};