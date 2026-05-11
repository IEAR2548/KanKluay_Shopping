const db = require('../db');

// ────────────────────────────────────────────────────────────
//  GET ยอดขายรายวัน 7 วันที่ผ่านมา
// ────────────────────────────────────────────────────────────
async function getWeeklySales(shopId) {
  const result = await db.query(
    `SELECT
       TO_CHAR(order_date, 'Dy')  AS day,
       DATE(order_date)           AS date,
       COALESCE(SUM(total_amount), 0) AS amount
     FROM "Order"
     WHERE shop_id = $1
       AND order_date >= NOW() - INTERVAL '7 days'
       AND order_status != 'cancelled'
     GROUP BY TO_CHAR(order_date, 'Dy'), DATE(order_date)
     ORDER BY DATE(order_date)`,
    [shopId]
  );
  return result.rows;
}

// ────────────────────────────────────────────────────────────
//  GET ยอดรวม: total sales, orders, เปรียบเทียบเดือนที่แล้ว
// ────────────────────────────────────────────────────────────
async function getShopStats(shopId) {
  const result = await db.query(
    `SELECT
       -- เดือนนี้
       COALESCE(SUM(CASE
         WHEN DATE_TRUNC('month', order_date) = DATE_TRUNC('month', NOW())
         THEN total_amount END), 0) AS this_month_sales,

       COALESCE(COUNT(CASE
         WHEN DATE_TRUNC('month', order_date) = DATE_TRUNC('month', NOW())
         THEN 1 END), 0) AS this_month_orders,

       -- เดือนที่แล้ว
       COALESCE(SUM(CASE
         WHEN DATE_TRUNC('month', order_date) = DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
         THEN total_amount END), 0) AS last_month_sales,

       COALESCE(COUNT(CASE
         WHEN DATE_TRUNC('month', order_date) = DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
         THEN 1 END), 0) AS last_month_orders,

       -- ทั้งหมด
       COALESCE(SUM(total_amount), 0) AS total_sales,
       COUNT(*)                        AS total_orders
     FROM "Order"
     WHERE shop_id = $1
       AND order_status != 'cancelled'`,
    [shopId]
  );

  const row = result.rows[0];
  const salesDiff   = parseFloat(row.this_month_sales)  - parseFloat(row.last_month_sales);
  const ordersDiff  = parseInt(row.this_month_orders)   - parseInt(row.last_month_orders);
  const salesPct    = row.last_month_sales > 0
    ? ((salesDiff / parseFloat(row.last_month_sales)) * 100).toFixed(1)
    : 0;
  const ordersPct   = row.last_month_orders > 0
    ? ((ordersDiff / parseInt(row.last_month_orders)) * 100).toFixed(1)
    : 0;

  return {
    total_sales:        parseFloat(row.total_sales),
    total_orders:       parseInt(row.total_orders),
    this_month_sales:   parseFloat(row.this_month_sales),
    last_month_sales:   parseFloat(row.last_month_sales),
    this_month_orders:  parseInt(row.this_month_orders),
    last_month_orders:  parseInt(row.last_month_orders),
    sales_diff:         salesDiff,
    orders_diff:        ordersDiff,
    sales_pct:          parseFloat(salesPct),
    orders_pct:         parseFloat(ordersPct),
  };
}

module.exports = { getWeeklySales, getShopStats };