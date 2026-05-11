// server/services/dashboardService.js
const pool = require("../db"); // ปรับ path ให้ตรงกับโปรเจกต์

// ============================================================
//  1. Summary Cards — Total User, Total Shop, Total Transactions
// ============================================================
const getSummaryCards = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM "User" WHERE role = 'user')           AS total_users,
      (SELECT COUNT(*) FROM Shop WHERE status = 'active')         AS total_shops,
      (SELECT COUNT(*) FROM "Order")                              AS total_transactions,
      (SELECT COUNT(*) FROM "Order" WHERE order_status = 'pending') AS pending_approvals,
      (SELECT COALESCE(SUM(total_amount), 0) FROM "Order"
        WHERE order_status != 'cancelled')                        AS total_revenue
  `);
  return result.rows[0];
};

// ============================================================
//  2. Transactions Trend — รายวัน (Last Week / Last Month)
// ============================================================
const getTransactionsTrend = async ({ range = "lastWeek" } = {}) => {
  let interval = "7 days";
  if (range === "lastMonth") interval = "30 days";

  const result = await pool.query(
    `SELECT
       DATE(order_date)          AS date,
       COUNT(*)                  AS total_orders,
       COALESCE(SUM(total_amount), 0) AS revenue
     FROM "Order"
     WHERE order_date >= NOW() - INTERVAL '${interval}'
     GROUP BY DATE(order_date)
     ORDER BY date ASC`
  );
  return result.rows;
};

// ============================================================
//  3. Sub-metrics bar (ตัวเลขเล็กๆ ใต้ tabs)
// ============================================================
const getSubMetrics = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM "User" WHERE role = 'user')             AS total_users,
      (SELECT COUNT(*) FROM Shop WHERE status = 'active')           AS total_shops,
      (SELECT COUNT(*) FROM "Order")                                AS total_transactions,
      (SELECT COUNT(*) FROM "Order" WHERE order_status = 'pending') AS pending_approvals,
      (SELECT COALESCE(SUM(total_amount), 0)
         FROM "Order" WHERE order_status != 'cancelled')            AS total_revenue
  `);
  return result.rows[0];
};

// ============================================================
//  4. Users in last 30 minutes — นับ user ที่สร้าง account ล่าสุด
//     (ใช้ created_at เป็น proxy เพราะไม่มี session table)
// ============================================================
const getRecentUsers = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS users_last_30min,
      DATE_TRUNC('minute', created_at) AS minute_bucket
    FROM "User"
    WHERE created_at >= NOW() - INTERVAL '30 minutes'
    GROUP BY minute_bucket
    ORDER BY minute_bucket ASC
  `);

  const total = await pool.query(`
    SELECT COUNT(*) AS total
    FROM "User"
    WHERE created_at >= NOW() - INTERVAL '30 minutes'
  `);

  return {
    total: total.rows[0].total,
    per_minute: result.rows,
  };
};

// ============================================================
//  5. Top Shops by Revenue (ใช้แทน Sales by Provinces
//     เพราะ schema ไม่มี province — สามารถ swap ทีหลังได้)
// ============================================================
const getTopShops = async ({ limit = 5 } = {}) => {
  const result = await pool.query(
    `SELECT
       s.shop_id,
       s.shop_name,
       COUNT(DISTINCT o.order_id)       AS total_orders,
       COALESCE(SUM(o.total_amount), 0) AS total_revenue
     FROM Shop s
     LEFT JOIN "Order" o ON s.shop_id = o.shop_id
       AND o.order_status != 'cancelled'
     GROUP BY s.shop_id, s.shop_name
     ORDER BY total_revenue DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

// ============================================================
//  6. New Users & New Shops ในช่วง 30 วันล่าสุด
//     (สำหรับ % change ใน stat cards)
// ============================================================
const getGrowthStats = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM "User"
        WHERE created_at >= NOW() - INTERVAL '30 days') AS new_users_30d,
      (SELECT COUNT(*) FROM "User"
        WHERE created_at >= NOW() - INTERVAL '60 days'
          AND created_at < NOW() - INTERVAL '30 days')  AS prev_users_30d,
      (SELECT COUNT(*) FROM Shop
        WHERE created_at >= NOW() - INTERVAL '30 days') AS new_shops_30d,
      (SELECT COUNT(*) FROM Shop
        WHERE created_at >= NOW() - INTERVAL '60 days'
          AND created_at < NOW() - INTERVAL '30 days')  AS prev_shops_30d,
      (SELECT COUNT(*) FROM "Order"
        WHERE order_date >= NOW() - INTERVAL '30 days') AS new_orders_30d,
      (SELECT COUNT(*) FROM "Order"
        WHERE order_date >= NOW() - INTERVAL '60 days'
          AND order_date < NOW() - INTERVAL '30 days')  AS prev_orders_30d
  `);
  return result.rows[0];
};

module.exports = {
  getSummaryCards,
  getTransactionsTrend,
  getSubMetrics,
  getRecentUsers,
  getTopShops,
  getGrowthStats,
};