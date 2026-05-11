// const db = require('../db');

// const getAllShops = async () => {
//   const result = await db.query('SELECT * FROM Shop ORDER BY shop_id');
//   return result.rows;
// };

// const getShopById = async (id) => {
//   const result = await db.query('SELECT * FROM Shop WHERE shop_id = $1', [id]);
//   return result.rows[0];
// };

// const createShop = async (user_id, shop_name, shop_description) => {
//   const result = await db.query(
//     'INSERT INTO Shop (user_id, shop_name, shop_description) VALUES ($1, $2, $3) RETURNING *',
//     [user_id, shop_name, shop_description]
//   );
//   return result.rows[0];
// };

// const updateShop = async (id, shop_name, shop_description) => {
//   const result = await db.query(
//     'UPDATE Shop SET shop_name = $1, shop_description = $2 WHERE shop_id = $3 RETURNING *',
//     [shop_name, shop_description, id]
//   );
//   return result.rows[0];
// };

// const deleteShop = async (id) => {
//   const client = await db.connect();
//   try {
//     await client.query('BEGIN');

//     // Get all products in this shop to delete their order items and inventory
//     const productsResult = await client.query(
//       'SELECT product_id FROM Product WHERE shop_id = $1',
//       [id]
//     );

//     // Delete order items and inventory for all products in this shop
//     for (const product of productsResult.rows) {
//       await client.query('DELETE FROM Order_Item WHERE product_id = $1', [product.product_id]);
//       await client.query('DELETE FROM Inventory WHERE product_id = $1', [product.product_id]);
//     }

//     // Delete all products in this shop
//     await client.query('DELETE FROM Product WHERE shop_id = $1', [id]);

//     // Delete all local categories in this shop
//     await client.query('DELETE FROM Local_Category WHERE shop_id = $1', [id]);

//     // Delete the shop
//     const result = await client.query(
//       'DELETE FROM Shop WHERE shop_id = $1 RETURNING *',
//       [id]
//     );

//     await client.query('COMMIT');
//     return result.rows[0];
//   } catch (e) {
//     await client.query('ROLLBACK');
//     throw e;
//   } finally {
//     client.release();
//   }
// };

// module.exports = {
//   getAllShops,
//   getShopById,
//   createShop,
//   updateShop,
//   deleteShop
// };

const db = require("../db");

const getAllShops = async () => {
  const result = await db.query("SELECT * FROM Shop ORDER BY shop_id");
  return result.rows;
};

const getShopById = async (id) => {
  const result = await db.query("SELECT * FROM Shop WHERE shop_id = $1", [id]);
  return result.rows[0];
};

const createShop = async (user_id, shop_name, shop_description, logo_url) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    
    // Check if user already has a shop
    const existing = await client.query("SELECT shop_id FROM Shop WHERE user_id = $1 LIMIT 1", [user_id]);
    if (existing.rows.length > 0) {
      throw new Error("You already have a shop. One user can only have one shop.");
    }
    
    // Create Shop
    const shopResult = await client.query(
      "INSERT INTO Shop (user_id, shop_name, shop_description, logo_url) VALUES ($1,$2,$3,$4) RETURNING *",
      [user_id, shop_name, shop_description, logo_url || null],
    );
    const shop = shopResult.rows[0];

    // Create Default Local Category (linked to General global cat, usually ID 1)
    await client.query(
      "INSERT INTO Local_Category (shop_id, global_cat_id, category_name) VALUES ($1, $2, $3)",
      [shop.shop_id, 1, 'General']
    );

    await client.query("COMMIT");
    return shop;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const updateShop = async (id, shop_name, shop_description, logo_url, status) => {
  const validStatuses = ['active', 'inactive', 'suspended'];
  const safeStatus = validStatuses.includes(status) ? status : undefined;

  let query;
  let params;

  if (safeStatus) {
    query = `UPDATE Shop
             SET shop_name=$1, shop_description=$2, logo_url=$3, status=$5
             WHERE shop_id=$4
             RETURNING *`;
    params = [shop_name, shop_description, logo_url || null, id, safeStatus];
  } else {
    query = `UPDATE Shop
             SET shop_name=$1, shop_description=$2, logo_url=$3
             WHERE shop_id=$4
             RETURNING *`;
    params = [shop_name, shop_description, logo_url || null, id];
  }

  const result = await db.query(query, params);
  return result.rows[0];
};

const deleteShop = async (id) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const productsResult = await client.query(
      "SELECT product_id FROM Product WHERE shop_id=$1",
      [id],
    );
    for (const product of productsResult.rows) {
      await client.query("DELETE FROM Order_Item WHERE product_id=$1", [
        product.product_id,
      ]);
      await client.query("DELETE FROM Inventory WHERE product_id=$1", [
        product.product_id,
      ]);
    }
    await client.query("DELETE FROM Product WHERE shop_id=$1", [id]);
    await client.query("DELETE FROM Local_Category WHERE shop_id=$1", [id]);
    const result = await client.query(
      "DELETE FROM Shop WHERE shop_id=$1 RETURNING *",
      [id],
    );
    await client.query("COMMIT");
    return result.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

const getShopByUserId = async (userId) => {
  const result = await db.query("SELECT * FROM Shop WHERE user_id = $1", [
    userId,
  ]);
  return result.rows;
};

module.exports = {
  getAllShops,
  getShopById,
  getShopByUserId,
  createShop,
  updateShop,
  deleteShop,
};
