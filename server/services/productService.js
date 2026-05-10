// const db = require('../db');

// const getAllProducts = async () => {
//   const result = await db.query(
//     `SELECT p.*, s.shop_name, lc.category_name, inv.quantity
//      FROM Product p
//      JOIN Shop s ON p.shop_id = s.shop_id
//      JOIN Local_Category lc ON p.local_cat_id = lc.local_cat_id
//      LEFT JOIN Inventory inv ON p.product_id = inv.product_id
//      ORDER BY p.product_id`
//   );
//   return result.rows;
// };

// const getProductById = async (id) => {
//   const result = await db.query(
//     `SELECT p.*, s.shop_name, lc.category_name, inv.quantity
//      FROM Product p
//      JOIN Shop s ON p.shop_id = s.shop_id
//      JOIN Local_Category lc ON p.local_cat_id = lc.local_cat_id
//      LEFT JOIN Inventory inv ON p.product_id = inv.product_id
//      WHERE p.product_id = $1`,
//     [id]
//   );
//   return result.rows[0];
// };

// const getProductsByShop = async (shop_id) => {
//   const result = await db.query(
//     `SELECT p.*, s.shop_name, lc.category_name, inv.quantity
//      FROM Product p
//      JOIN Shop s ON p.shop_id = s.shop_id
//      JOIN Local_Category lc ON p.local_cat_id = lc.local_cat_id
//      LEFT JOIN Inventory inv ON p.product_id = inv.product_id
//      WHERE p.shop_id = $1
//      ORDER BY p.product_id`,
//     [shop_id]
//   );
//   return result.rows;
// };

// const createProduct = async (shop_id, local_cat_id, product_name, description, price, quantity) => {
//   const client = await db.connect();
//   try {
//     await client.query('BEGIN');

//     // Insert Product
//     const productResult = await client.query(
//       'INSERT INTO Product (shop_id, local_cat_id, product_name, description, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//       [shop_id, local_cat_id, product_name, description, price]
//     );

//     const product = productResult.rows[0];

//     // Insert Inventory
//     await client.query(
//       'INSERT INTO Inventory (product_id, quantity) VALUES ($1, $2)',
//       [product.product_id, quantity]
//     );

//     await client.query('COMMIT');

//     // Fetch complete product with inventory
//     const completeProduct = await db.query(
//       `SELECT p.*, inv.quantity
//        FROM Product p
//        LEFT JOIN Inventory inv ON p.product_id = inv.product_id
//        WHERE p.product_id = $1`,
//       [product.product_id]
//     );

//     return completeProduct.rows[0];
//   } catch (e) {
//     await client.query('ROLLBACK');
//     throw e;
//   } finally {
//     client.release();
//   }
// };

// const updateProduct = async (id, product_name, description, price) => {
//   const result = await db.query(
//     'UPDATE Product SET product_name = $1, description = $2, price = $3 WHERE product_id = $4 RETURNING *',
//     [product_name, description, price, id]
//   );
//   return result.rows[0];
// };

// const deleteProduct = async (id) => {
//   const client = await db.connect();
//   try {
//     await client.query('BEGIN');

//     // Delete Order Items first (foreign key reference)
//     await client.query('DELETE FROM Order_Item WHERE product_id = $1', [id]);

//     // Delete Inventory records
//     await client.query('DELETE FROM Inventory WHERE product_id = $1', [id]);

//     // Delete Product
//     const result = await client.query(
//       'DELETE FROM Product WHERE product_id = $1 RETURNING *',
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
//   getAllProducts,
//   getProductById,
//   getProductsByShop,
//   createProduct,
//   updateProduct,
//   deleteProduct
// };

const db = require("../db");

const getAllProducts = async () => {
  const result = await db.query(`
    SELECT p.*, s.shop_name, lc.category_name, inv.quantity
    FROM Product p
    JOIN Shop s ON p.shop_id = s.shop_id
    JOIN Local_Category lc ON p.local_cat_id = lc.local_cat_id
    LEFT JOIN Inventory inv ON p.product_id = inv.product_id
    ORDER BY p.product_id
  `);
  return result.rows;
};

const getProductById = async (id) => {
  const result = await db.query(
    `
    SELECT p.*, s.shop_name, s.logo_url AS shop_logo, lc.category_name, inv.quantity
    FROM Product p
    JOIN Shop s ON p.shop_id = s.shop_id
    JOIN Local_Category lc ON p.local_cat_id = lc.local_cat_id
    LEFT JOIN Inventory inv ON p.product_id = inv.product_id
    WHERE p.product_id = $1
  `,
    [id],
  );
  return result.rows[0];
};

const getProductsByShop = async (shop_id) => {
  const result = await db.query(
    `
    SELECT p.*, s.shop_name, lc.category_name, inv.quantity
    FROM Product p
    JOIN Shop s ON p.shop_id = s.shop_id
    JOIN Local_Category lc ON p.local_cat_id = lc.local_cat_id
    LEFT JOIN Inventory inv ON p.product_id = inv.product_id
    WHERE p.shop_id = $1
    ORDER BY p.product_id
  `,
    [shop_id],
  );
  return result.rows;
};

const createProduct = async (
  shop_id,
  local_cat_id,
  product_name,
  description,
  price,
  quantity,
  image_url,
) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const productResult = await client.query(
      "INSERT INTO Product (shop_id, local_cat_id, product_name, description, price, image_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [
        shop_id,
        local_cat_id,
        product_name,
        description,
        price,
        image_url || null,
      ],
    );
    const product = productResult.rows[0];
    await client.query(
      "INSERT INTO Inventory (product_id, quantity) VALUES ($1,$2)",
      [product.product_id, quantity],
    );
    await client.query("COMMIT");
    const complete = await db.query(
      `SELECT p.*, inv.quantity FROM Product p LEFT JOIN Inventory inv ON p.product_id = inv.product_id WHERE p.product_id = $1`,
      [product.product_id],
    );
    return complete.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

const updateProduct = async (
  id,
  product_name,
  description,
  price,
  image_url,
) => {
  const result = await db.query(
    "UPDATE Product SET product_name=$1, description=$2, price=$3, image_url=$4 WHERE product_id=$5 RETURNING *",
    [product_name, description, price, image_url || null, id],
  );
  return result.rows[0];
};

const deleteProduct = async (id) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM Order_Item WHERE product_id=$1", [id]);
    await client.query("DELETE FROM Inventory WHERE product_id=$1", [id]);
    const result = await client.query(
      "DELETE FROM Product WHERE product_id=$1 RETURNING *",
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

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByShop,
  createProduct,
  updateProduct,
  deleteProduct,
};
