const db = require('../db');

// ==================== Global Category ====================

const getAllGlobalCategories = async () => {
  const result = await db.query('SELECT * FROM Global_Category ORDER BY global_cat_id');
  return result.rows;
};

const getGlobalCategoryById = async (id) => {
  const result = await db.query('SELECT * FROM Global_Category WHERE global_cat_id = $1', [id]);
  return result.rows[0];
};

const createGlobalCategory = async (category_name) => {
  const result = await db.query(
    'INSERT INTO Global_Category (category_name) VALUES ($1) RETURNING *',
    [category_name]
  );
  return result.rows[0];
};

const deleteGlobalCategory = async (id) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Delete all local categories that reference this global category
    const localCatsResult = await client.query(
      'SELECT local_cat_id FROM Local_Category WHERE global_cat_id = $1',
      [id]
    );

    for (const localCat of localCatsResult.rows) {
      // Delete products that use this local category
      const productsResult = await client.query(
        'SELECT product_id FROM Product WHERE local_cat_id = $1',
        [localCat.local_cat_id]
      );

      for (const product of productsResult.rows) {
        await client.query('DELETE FROM Order_Item WHERE product_id = $1', [product.product_id]);
        await client.query('DELETE FROM Inventory WHERE product_id = $1', [product.product_id]);
      }

      await client.query('DELETE FROM Product WHERE local_cat_id = $1', [localCat.local_cat_id]);
    }

    await client.query('DELETE FROM Local_Category WHERE global_cat_id = $1', [id]);

    // Delete the global category
    const result = await client.query(
      'DELETE FROM Global_Category WHERE global_cat_id = $1 RETURNING *',
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

// ==================== Local Category ====================

const getAllLocalCategories = async () => {
  const result = await db.query(
    `SELECT lc.*, g.category_name AS global_category_name, s.shop_name 
     FROM Local_Category lc 
     JOIN Global_Category g ON lc.global_cat_id = g.global_cat_id 
     JOIN Shop s ON lc.shop_id = s.shop_id 
     ORDER BY lc.local_cat_id`
  );
  return result.rows;
};

const getLocalCategoriesByShop = async (shop_id) => {
  const result = await db.query(
    `SELECT lc.*, g.category_name AS global_category_name 
     FROM Local_Category lc 
     JOIN Global_Category g ON lc.global_cat_id = g.global_cat_id 
     WHERE lc.shop_id = $1 
     ORDER BY lc.local_cat_id`,
    [shop_id]
  );
  return result.rows;
};

const createLocalCategory = async (shop_id, global_cat_id, category_name) => {
  const result = await db.query(
    'INSERT INTO Local_Category (shop_id, global_cat_id, category_name) VALUES ($1, $2, $3) RETURNING *',
    [shop_id, global_cat_id, category_name]
  );
  return result.rows[0];
};

const deleteLocalCategory = async (id) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Delete order items and inventory for all products in this local category
    const productsResult = await client.query(
      'SELECT product_id FROM Product WHERE local_cat_id = $1',
      [id]
    );

    for (const product of productsResult.rows) {
      await client.query('DELETE FROM Order_Item WHERE product_id = $1', [product.product_id]);
      await client.query('DELETE FROM Inventory WHERE product_id = $1', [product.product_id]);
    }

    // Delete all products in this local category
    await client.query('DELETE FROM Product WHERE local_cat_id = $1', [id]);

    // Delete the local category
    const result = await client.query(
      'DELETE FROM Local_Category WHERE local_cat_id = $1 RETURNING *',
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
  getAllGlobalCategories,
  getGlobalCategoryById,
  createGlobalCategory,
  deleteGlobalCategory,
  getAllLocalCategories,
  getLocalCategoriesByShop,
  createLocalCategory,
  deleteLocalCategory
};
