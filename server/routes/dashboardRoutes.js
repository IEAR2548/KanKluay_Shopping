// server/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// GET /dashboard/summary
// คืน total_users, total_shops, total_transactions, pending_approvals, total_revenue
router.get("/summary", dashboardController.getSummaryCards);

// GET /dashboard/trend
// Query: ?range=lastWeek | lastMonth
// คืน array รายวัน { date, total_orders, revenue }
router.get("/trend", dashboardController.getTransactionsTrend);

// GET /dashboard/sub-metrics
// คืนตัวเลข sub-metrics ใต้กราฟ
router.get("/sub-metrics", dashboardController.getSubMetrics);

// GET /dashboard/recent-users
// คืนจำนวน user ใน 30 นาทีล่าสุด + breakdown per minute
router.get("/recent-users", dashboardController.getRecentUsers);

// GET /dashboard/top-shops
// Query: ?limit=5
// คืนร้านที่มียอดขายสูงสุด
router.get("/top-shops", dashboardController.getTopShops);

// GET /dashboard/growth
// คืน % growth เทียบ 30 วันก่อนหน้า
router.get("/growth", dashboardController.getGrowthStats);

module.exports = router;