// const db = require("../db");

// // User

// const getAllUsers = () =>
//   db.query(`
//     SELECT user_id, firstname, lastname, username, email,
//            phone_number, role, status, created_at
//     FROM "User"
//     ORDER BY user_id
//   `);

// const getUserById = (id) =>
//   db.query(
//     `
//     SELECT user_id, firstname, lastname, username, email,
//            phone_number, role, status, created_at
//     FROM "User"
//     WHERE user_id = $1
//   `,
//     [id],
//   );

// const createUser = (
//   firstname,
//   lastname,
//   username,
//   email,
//   password,
//   phone_number,
//   role,
// ) =>
//   db.query(
//     `
//     INSERT INTO "User" (firstname, lastname, username, email, password, phone_number, role)
//     VALUES ($1,$2,$3,$4,$5,$6,$7)
//     RETURNING user_id, firstname, lastname, username, email, phone_number, role, status, created_at
//   `,
//     [
//       firstname,
//       lastname,
//       username,
//       email,
//       password,
//       phone_number,
//       role || "user",
//     ],
//   );

// const updateUser = (id, firstname, lastname, username, email, phone_number) =>
//   db.query(
//     `
//     UPDATE "User"
//     SET firstname=$1, lastname=$2, username=$3, email=$4, phone_number=$5
//     WHERE user_id=$6
//     RETURNING user_id, firstname, lastname, username, email, phone_number, role, status, created_at
//   `,
//     [firstname, lastname, username, email, phone_number, id],
//   );

// const updateUserStatus = (id, status) =>
//   db.query(
//     `
//     UPDATE "User" SET status=$1 WHERE user_id=$2
//     RETURNING user_id, username, status
//   `,
//     [status, id],
//   );

// const deleteUser = (id) =>
//   db.query(`DELETE FROM "User" WHERE user_id=$1 RETURNING user_id`, [id]);

// // ─── User Address ─────────────────────────────────────────────────────────────

// const getAddressesByUser = (user_id) =>
//   db.query(
//     `
//     SELECT * FROM User_Address
//     WHERE user_id=$1
//     ORDER BY is_default DESC, address_id
//   `,
//     [user_id],
//   );

// const createAddress = (
//   user_id,
//   recipient_name,
//   phone_number,
//   address_detail,
//   is_default,
// ) =>
//   db.query(
//     `
//     INSERT INTO User_Address (user_id, recipient_name, phone_number, address_detail, is_default)
//     VALUES ($1,$2,$3,$4,$5)
//     RETURNING *
//   `,
//     [
//       user_id,
//       recipient_name,
//       phone_number,
//       address_detail,
//       is_default || false,
//     ],
//   );

// const updateAddress = (
//   address_id,
//   user_id,
//   recipient_name,
//   phone_number,
//   address_detail,
//   is_default,
// ) =>
//   db.query(
//     `
//     UPDATE User_Address
//     SET recipient_name=$1, phone_number=$2, address_detail=$3, is_default=$4
//     WHERE address_id=$5 AND user_id=$6
//     RETURNING *
//   `,
//     [
//       recipient_name,
//       phone_number,
//       address_detail,
//       is_default,
//       address_id,
//       user_id,
//     ],
//   );

// const deleteAddress = (address_id, user_id) =>
//   db.query(
//     `
//     DELETE FROM User_Address
//     WHERE address_id=$1 AND user_id=$2
//     RETURNING address_id
//   `,
//     [address_id, user_id],
//   );

// module.exports = {
//   getAllUsers,
//   getUserById,
//   createUser,
//   updateUser,
//   updateUserStatus,
//   deleteUser,
//   getAddressesByUser,
//   createAddress,
//   updateAddress,
//   deleteAddress,
// };

const db = require("../db");

/**
 * ดึง user จาก email (ใช้ใน authService)
 */
const getUserByEmail = async (email) => {
  const result = await db.query(
    `SELECT * FROM "User" WHERE email = $1 LIMIT 1`,
    [email],
  );
  return result.rows[0] || null;
};

/**
 * สร้าง user ใหม่ (ใช้ใน register)
 */
const createUser = async ({
  firstname,
  lastname,
  username,
  email,
  password,
  phone_number,
  role,
  status,
}) => {
  const result = await db.query(
    `INSERT INTO "User" (firstname, lastname, username, email, password, phone_number, role, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING user_id, firstname, lastname, username, email, phone_number, role, status, created_at`,
    [
      firstname,
      lastname,
      username,
      email,
      password,
      phone_number,
      role,
      status,
    ],
  );
  return result.rows[0];
};

/**
 * ดึง user จาก user_id (ใช้ใน protected routes)
 */
const getUserById = async (user_id) => {
  const result = await db.query(
    `SELECT user_id, firstname, lastname, username, email, phone_number, role, status, image_url, created_at
     FROM "User" WHERE user_id = $1 LIMIT 1`,
    [user_id],
  );
  return result.rows[0] || null;
};

const getAllUsers = () =>
  db.query(`
    SELECT user_id, firstname, lastname, username, email,
           phone_number, image_url, role, status, created_at
    FROM "User"
    ORDER BY user_id
  `);

// const getUserById = (id) =>
//   db.query(
//     `
//     SELECT user_id, firstname, lastname, username, email,
//            phone_number, image_url, role, status, created_at
//     FROM "User"
//     WHERE user_id = $1
//   `,
//     [id],
//   );

// const createUser = (
//   firstname,
//   lastname,
//   username,
//   email,
//   password,
//   phone_number,
//   image_url,
//   role,
// ) =>
//   db.query(
//     `
//     INSERT INTO "User" (firstname, lastname, username, email, password, phone_number, image_url, role)
//     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//     RETURNING user_id, firstname, lastname, username, email, phone_number, image_url, role, status, created_at
//   `,
//     [
//       firstname,
//       lastname,
//       username,
//       email,
//       password,
//       phone_number,
//       image_url || null,
//       role || "user",
//     ],
//   );

const updateUser = (
  id,
  firstname,
  lastname,
  username,
  email,
  phone_number,
  image_url,
) =>
  db.query(
    `
    UPDATE "User"
    SET firstname=$1, lastname=$2, username=$3, email=$4, phone_number=$5, image_url=$6
    WHERE user_id=$7
    RETURNING user_id, firstname, lastname, username, email, phone_number, image_url, role, status, created_at
  `,
    [firstname, lastname, username, email, phone_number, image_url || null, id],
  );

const updateUserStatus = (id, status) =>
  db.query(
    `
    UPDATE "User" SET status=$1 WHERE user_id=$2
    RETURNING user_id, username, status
  `,
    [status, id],
  );

const deleteUser = (id) =>
  db.query(`DELETE FROM "User" WHERE user_id=$1 RETURNING user_id`, [id]);

const getAddressesByUser = (user_id) =>
  db.query(
    `
    SELECT * FROM User_Address
    WHERE user_id=$1
    ORDER BY is_default DESC, address_id
  `,
    [user_id],
  );

const createAddress = (
  user_id,
  recipient_name,
  phone_number,
  address_detail,
  is_default,
) =>
  db.query(
    `
    INSERT INTO User_Address (user_id, recipient_name, phone_number, address_detail, is_default)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
  `,
    [
      user_id,
      recipient_name,
      phone_number,
      address_detail,
      is_default || false,
    ],
  );

const updateAddress = (
  address_id,
  user_id,
  recipient_name,
  phone_number,
  address_detail,
  is_default,
) =>
  db.query(
    `
    UPDATE User_Address
    SET recipient_name=$1, phone_number=$2, address_detail=$3, is_default=$4
    WHERE address_id=$5 AND user_id=$6
    RETURNING *
  `,
    [
      recipient_name,
      phone_number,
      address_detail,
      is_default,
      address_id,
      user_id,
    ],
  );

const deleteAddress = (address_id, user_id) =>
  db.query(
    `
    DELETE FROM User_Address
    WHERE address_id=$1 AND user_id=$2
    RETURNING address_id
  `,
    [address_id, user_id],
  );

module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  updateUserStatus,
  deleteUser,
  getAddressesByUser,
  createAddress,
  updateAddress,
  deleteAddress,
};
