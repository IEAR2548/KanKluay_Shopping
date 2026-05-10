const db = require('../db');

// GET ที่อยู่ทั้งหมดของ user (default อยู่บนสุด)
async function getAddressesByUser(userId) {
  const result = await db.query(
    `SELECT * FROM User_Address
     WHERE user_id = $1
     ORDER BY is_default DESC, address_id ASC`,
    [userId]
  );
  return result.rows;
}

// GET ที่อยู่ชิ้นนั้น
async function getAddressById(addressId) {
  const result = await db.query(
    'SELECT * FROM User_Address WHERE address_id = $1',
    [addressId]
  );
  if (result.rows.length === 0) throw new Error('ไม่พบที่อยู่นี้');
  return result.rows[0];
}

module.exports = { getAddressesByUser, getAddressById };