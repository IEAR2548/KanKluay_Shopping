const db = require('../db');

const getAllShops = async () => {
  const result = await db.query('SELECT * FROM Shop ORDER BY shop_id');
  return result.rows;
};

const getShopById = async (id) => {
  const result = await db.query('SELECT * FROM Shop WHERE shop_id = $1', [id]);
  return result.rows[0];
};

const createShop = async (user_id, shop_name, shop_description) => {
  const result = await db.query(
    'INSERT INTO Shop (user_id, shop_name, shop_description) VALUES ($1, $2, $3) RETURNING *',
    [user_id, shop_name, shop_description]
  );
  return result.rows[0];
};

const updateShop = async (id, shop_name, shop_description) => {
  const result = await db.query(
    'UPDATE Shop SET shop_name = $1, shop_description = $2 WHERE shop_id = $3 RETURNING *',
    [shop_name, shop_description, id]
  );
  return result.rows[0];
};

const deleteShop = async (id) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Get all products in this shop to delete their order items and inventory
    const productsResult = await client.query(
      'SELECT product_id FROM Product WHERE shop_id = $1',
      [id]
    );

    // Delete order items and inventory for all products in this shop
    for (const product of productsResult.rows) {
      await client.query('DELETE FROM Order_Item WHERE product_id = $1', [product.product_id]);
      await client.query('DELETE FROM Inventory WHERE product_id = $1', [product.product_id]);
    }

    // Delete all products in this shop
    await client.query('DELETE FROM Product WHERE shop_id = $1', [id]);

    // Delete all local categories in this shop
    await client.query('DELETE FROM Local_Category WHERE shop_id = $1', [id]);

    // Delete the shop
    const result = await client.query(
      'DELETE FROM Shop WHERE shop_id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop
};
