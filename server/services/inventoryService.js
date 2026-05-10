const db = require('../db');

// ────────────────────────────────────────────────────────────
//  Helper: คำนวณ stock_status จาก quantity
// ────────────────────────────────────────────────────────────
function getStockStatus(quantity) {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= 5) return 'low_stock';
  return 'in_stock';
}

// ────────────────────────────────────────────────────────────
//  GET inventory ทั้งหมด (JOIN Product + Shop)
// ────────────────────────────────────────────────────────────
async function getAllInventory() {
  const result = await db.query(
    `SELECT
       inv.product_id,
       p.product_name,
       p.price,
       s.shop_id,
       s.shop_name,
       inv.quantity,
       inv.last_updated,
       CASE
         WHEN inv.quantity = 0  THEN 'out_of_stock'
         WHEN inv.quantity <= 5 THEN 'low_stock'
         ELSE 'in_stock'
       END AS stock_status
     FROM Inventory inv
     JOIN Product p ON p.product_id = inv.product_id
     JOIN Shop    s ON s.shop_id    = p.shop_id
     ORDER BY inv.product_id`
  );
  return result.rows;
}

// ────────────────────────────────────────────────────────────
//  GET inventory ของสินค้าชิ้นนั้น
// ────────────────────────────────────────────────────────────
async function getInventoryByProduct(productId) {
  const result = await db.query(
    `SELECT
       inv.product_id,
       p.product_name,
       p.price,
       s.shop_id,
       s.shop_name,
       inv.quantity,
       inv.last_updated,
       CASE
         WHEN inv.quantity = 0  THEN 'out_of_stock'
         WHEN inv.quantity <= 5 THEN 'low_stock'
         ELSE 'in_stock'
       END AS stock_status
     FROM Inventory inv
     JOIN Product p ON p.product_id = inv.product_id
     JOIN Shop    s ON s.shop_id    = p.shop_id
     WHERE inv.product_id = $1`,
    [productId]
  );

  if (result.rows.length === 0) {
    throw new Error('ไม่พบ inventory ของสินค้านี้');
  }
  return result.rows[0];
}

// ────────────────────────────────────────────────────────────
//  GET inventory ทั้งหมดของร้านนั้น
// ────────────────────────────────────────────────────────────
async function getInventoryByShop(shopId) {
  const result = await db.query(
    `SELECT
       inv.product_id,
       p.product_name,
       p.price,
       inv.quantity,
       inv.last_updated,
       CASE
         WHEN inv.quantity = 0  THEN 'out_of_stock'
         WHEN inv.quantity <= 5 THEN 'low_stock'
         ELSE 'in_stock'
       END AS stock_status
     FROM Inventory inv
     JOIN Product p ON p.product_id = inv.product_id
     WHERE p.shop_id = $1
     ORDER BY inv.product_id`,
    [shopId]
  );
  return result.rows;
}

// ────────────────────────────────────────────────────────────
//  PUT อัปเดต quantity ตรงๆ
// ────────────────────────────────────────────────────────────
async function setQuantity(productId, quantity) {
  if (quantity < 0) {
    throw new Error('quantity ต้องไม่ติดลบ');
  }

  const result = await db.query(
    `UPDATE Inventory
     SET quantity = $1, last_updated = NOW()
     WHERE product_id = $2
     RETURNING *`,
    [quantity, productId]
  );

  if (result.rows.length === 0) {
    throw new Error('ไม่พบ inventory ของสินค้านี้');
  }

  return { ...result.rows[0], stock_status: getStockStatus(result.rows[0].quantity) };
}

// ────────────────────────────────────────────────────────────
//  PUT เพิ่ม stock (รับสินค้าเข้า)
// ────────────────────────────────────────────────────────────
async function addStock(productId, amount) {
  if (amount <= 0) {
    throw new Error('amount ต้องมากกว่า 0');
  }

  const result = await db.query(
    `UPDATE Inventory
     SET quantity = quantity + $1, last_updated = NOW()
     WHERE product_id = $2
     RETURNING *`,
    [amount, productId]
  );

  if (result.rows.length === 0) {
    throw new Error('ไม่พบ inventory ของสินค้านี้');
  }

  return { ...result.rows[0], stock_status: getStockStatus(result.rows[0].quantity) };
}

// ────────────────────────────────────────────────────────────
//  PUT ลด stock (สินค้าเสีย / สูญหาย)
// ────────────────────────────────────────────────────────────
async function subtractStock(productId, amount) {
  if (amount <= 0) {
    throw new Error('amount ต้องมากกว่า 0');
  }

  // ตรวจก่อนว่า stock พอ
  const current = await db.query(
    'SELECT quantity FROM Inventory WHERE product_id = $1',
    [productId]
  );
  if (current.rows.length === 0) {
    throw new Error('ไม่พบ inventory ของสินค้านี้');
  }
  if (current.rows[0].quantity < amount) {
    throw new Error('สต็อกไม่เพียงพอ');
  }

  const result = await db.query(
    `UPDATE Inventory
     SET quantity = quantity - $1, last_updated = NOW()
     WHERE product_id = $2
     RETURNING *`,
    [amount, productId]
  );

  return { ...result.rows[0], stock_status: getStockStatus(result.rows[0].quantity) };
}

module.exports = {
  getAllInventory,
  getInventoryByProduct,
  getInventoryByShop,
  setQuantity,
  addStock,
  subtractStock,
};