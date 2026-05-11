const pool = require("../db"); // ปรับ path ให้ตรงกับ db connection ของโปรเจกต์

//  1. สรุปภาพรวม (Summary Cards บน Dashboard)
const getSummary = async ({ startDate, endDate } = {}) => {
  const dateFilter =
    startDate && endDate
      ? `AND o.order_date BETWEEN $1 AND $2`
      : "";
  const params = startDate && endDate ? [startDate, endDate] : [];

  const result = await pool.query(
    `SELECT
       COUNT(*)                                        AS total_orders,
       COALESCE(SUM(o.total_amount), 0)               AS total_revenue,
       COALESCE(SUM(o.platform_fee), 0)               AS total_platform_fee,
       COALESCE(SUM(o.net_amount), 0)                 AS total_net_amount,
       COUNT(*) FILTER (WHERE o.order_status = 'completed')   AS completed_orders,
       COUNT(*) FILTER (WHERE o.order_status = 'cancelled')   AS cancelled_orders,
       COUNT(*) FILTER (WHERE o.order_status = 'pending')     AS pending_orders
     FROM "Order" o
     WHERE 1=1 ${dateFilter}`,
    params
  );

  return result.rows[0];
};

//  2. ยอดขายรายวัน (Revenue by Day)
const getDailyRevenue = async ({ startDate, endDate }) => {
  const result = await pool.query(
    `SELECT
       DATE(o.order_date)            AS date,
       COUNT(*)                      AS total_orders,
       COALESCE(SUM(o.total_amount), 0) AS revenue,
       COALESCE(SUM(o.platform_fee), 0) AS platform_fee,
       COALESCE(SUM(o.net_amount), 0)   AS net_amount
     FROM "Order" o
     WHERE o.order_date BETWEEN $1 AND $2
       AND o.order_status != 'cancelled'
     GROUP BY DATE(o.order_date)
     ORDER BY DATE(o.order_date) ASC`,
    [startDate, endDate]
  );

  return result.rows;
};

//  3. ยอดขายรายเดือน (Revenue by Month)
const getMonthlyRevenue = async ({ year }) => {
  const targetYear = year || new Date().getFullYear();

  const result = await pool.query(
    `SELECT
       TO_CHAR(o.order_date, 'YYYY-MM')    AS month,
       COUNT(*)                            AS total_orders,
       COALESCE(SUM(o.total_amount), 0)    AS revenue,
       COALESCE(SUM(o.platform_fee), 0)    AS platform_fee,
       COALESCE(SUM(o.net_amount), 0)      AS net_amount
     FROM "Order" o
     WHERE EXTRACT(YEAR FROM o.order_date) = $1
       AND o.order_status != 'cancelled'
     GROUP BY TO_CHAR(o.order_date, 'YYYY-MM')
     ORDER BY month ASC`,
    [targetYear]
  );

  return result.rows;
};

//  4. สินค้าขายดี Top N (Best Selling Products)
const getTopProducts = async ({ limit = 10, startDate, endDate } = {}) => {
  const dateFilter =
    startDate && endDate
      ? `AND o.order_date BETWEEN $2 AND $3`
      : "";
  const params =
    startDate && endDate ? [limit, startDate, endDate] : [limit];

  const result = await pool.query(
    `SELECT
       p.product_id,
       p.product_name,
       s.shop_name,
       gc.category_name                       AS global_category,
       SUM(oi.quantity)                        AS total_quantity_sold,
       SUM(oi.quantity * oi.price_at_purchase) AS total_revenue
     FROM Order_Item oi
     JOIN "Order" o   ON oi.order_id   = o.order_id
     JOIN Product p   ON oi.product_id = p.product_id
     JOIN Shop s      ON p.shop_id     = s.shop_id
     JOIN Local_Category lc  ON p.local_cat_id  = lc.local_cat_id
     JOIN Global_Category gc ON lc.global_cat_id = gc.global_cat_id
     WHERE o.order_status != 'cancelled' ${dateFilter}
     GROUP BY p.product_id, p.product_name, s.shop_name, gc.category_name
     ORDER BY total_quantity_sold DESC
     LIMIT $1`,
    params
  );

  return result.rows;
};

//  5. สรุปรายได้แยกตามร้านค้า (Revenue by Shop)
const getRevenueByShop = async ({ startDate, endDate, limit = 20 } = {}) => {
  const dateFilter =
    startDate && endDate
      ? `AND o.order_date BETWEEN $2 AND $3`
      : "";
  const params =
    startDate && endDate ? [limit, startDate, endDate] : [limit];

  const result = await pool.query(
    `SELECT
       s.shop_id,
       s.shop_name,
       s.status                              AS shop_status,
       COUNT(DISTINCT o.order_id)            AS total_orders,
       COALESCE(SUM(o.total_amount), 0)      AS total_revenue,
       COALESCE(SUM(o.platform_fee), 0)      AS total_platform_fee,
       COALESCE(SUM(o.net_amount), 0)        AS total_net_amount
     FROM Shop s
     LEFT JOIN "Order" o ON s.shop_id = o.shop_id
       AND o.order_status != 'cancelled' ${dateFilter}
     GROUP BY s.shop_id, s.shop_name, s.status
     ORDER BY total_revenue DESC
     LIMIT $1`,
    params
  );

  return result.rows;
};


//  6. สรุป Payout ทั้งหมด (Payout Overview)

const getPayoutSummary = async ({ status, startDate, endDate } = {}) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (status) {
    conditions.push(`sp.status = $${idx++}`);
    params.push(status);
  }
  if (startDate && endDate) {
    conditions.push(`sp.payout_date BETWEEN $${idx} AND $${idx + 1}`);
    params.push(startDate, endDate);
    idx += 2;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `SELECT
       sp.payout_id,
       sp.shop_id,
       s.shop_name,
       sp.order_id,
       sp.payout_date,
       sp.net_amount,
       sp.status
     FROM Shop_Payout sp
     JOIN Shop s ON sp.shop_id = s.shop_id
     ${whereClause}
     ORDER BY sp.payout_date DESC`,
    params
  );

  return result.rows;
};


//  7. Payout สรุปยอดรวม (Payout Stats)

const getPayoutStats = async () => {
  const result = await pool.query(
    `SELECT
       COUNT(*)                                              AS total_payouts,
       COALESCE(SUM(net_amount), 0)                         AS total_amount,
       COALESCE(SUM(net_amount) FILTER (WHERE status = 'pending'), 0)   AS pending_amount,
       COUNT(*) FILTER (WHERE status = 'pending')           AS pending_count,
       COALESCE(SUM(net_amount) FILTER (WHERE status = 'completed'), 0) AS completed_amount,
       COUNT(*) FILTER (WHERE status = 'completed')         AS completed_count
     FROM Shop_Payout`
  );

  return result.rows[0];
};


//  8. Payout รายร้าน (Payout by Shop)
const getPayoutByShop = async ({ shopId } = {}) => {
  const whereClause = shopId ? `WHERE sp.shop_id = $1` : "";
  const params = shopId ? [shopId] : [];

  const result = await pool.query(
    `SELECT
       s.shop_id,
       s.shop_name,
       COUNT(sp.payout_id)                                        AS total_payouts,
       COALESCE(SUM(sp.net_amount), 0)                            AS total_payout_amount,
       COALESCE(SUM(sp.net_amount) FILTER (WHERE sp.status = 'pending'), 0)   AS pending_amount,
       COALESCE(SUM(sp.net_amount) FILTER (WHERE sp.status = 'completed'), 0) AS completed_amount
     FROM Shop_Payout sp
     JOIN Shop s ON sp.shop_id = s.shop_id
     ${whereClause}
     GROUP BY s.shop_id, s.shop_name
     ORDER BY total_payout_amount DESC`,
    params
  );

  return result.rows;
};

//  9. สรุปตามหมวดหมู่ (Revenue by Category)
const getRevenueByCategory = async ({ startDate, endDate } = {}) => {
  const dateFilter =
    startDate && endDate
      ? `AND o.order_date BETWEEN $1 AND $2`
      : "";
  const params = startDate && endDate ? [startDate, endDate] : [];

  const result = await pool.query(
    `SELECT
       gc.global_cat_id,
       gc.category_name,
       SUM(oi.quantity)                        AS total_quantity_sold,
       SUM(oi.quantity * oi.price_at_purchase) AS total_revenue
     FROM Order_Item oi
     JOIN "Order" o          ON oi.order_id    = o.order_id
     JOIN Product p          ON oi.product_id  = p.product_id
     JOIN Local_Category lc  ON p.local_cat_id = lc.local_cat_id
     JOIN Global_Category gc ON lc.global_cat_id = gc.global_cat_id
     WHERE o.order_status != 'cancelled' ${dateFilter}
     GROUP BY gc.global_cat_id, gc.category_name
     ORDER BY total_revenue DESC`,
    params
  );

  return result.rows;
};


//  10. สรุปสถานะ Order (Order Status Breakdown)

const getOrderStatusBreakdown = async ({ startDate, endDate } = {}) => {
  const dateFilter =
    startDate && endDate
      ? `WHERE order_date BETWEEN $1 AND $2`
      : "";
  const params = startDate && endDate ? [startDate, endDate] : [];

  const result = await pool.query(
    `SELECT
       order_status,
       shipping_status,
       COUNT(*) AS count
     FROM "Order"
     ${dateFilter}
     GROUP BY order_status, shipping_status
     ORDER BY order_status, shipping_status`,
    params
  );

  return result.rows;
};

module.exports = {
  getSummary,
  getDailyRevenue,
  getMonthlyRevenue,
  getTopProducts,
  getRevenueByShop,
  getPayoutSummary,
  getPayoutStats,
  getPayoutByShop,
  getRevenueByCategory,
  getOrderStatusBreakdown,
};