const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// -------------------------------------------------------
//  Dashboard Summary
// -------------------------------------------------------
// GET /api/reports/summary
// Query: ?startDate=2024-01-01&endDate=2024-12-31
router.get("/summary", reportController.getSummary);

// -------------------------------------------------------
//  Revenue
// -------------------------------------------------------
// GET /api/reports/revenue/daily
// Query: ?startDate=2024-01-01&endDate=2024-01-31
router.get("/revenue/daily", reportController.getDailyRevenue);

// GET /api/reports/revenue/monthly
// Query: ?year=2024
router.get("/revenue/monthly", reportController.getMonthlyRevenue);

// GET /api/reports/revenue/shops
// Query: ?limit=20&startDate=...&endDate=...
router.get("/revenue/shops", reportController.getRevenueByShop);

// GET /api/reports/revenue/categories
// Query: ?startDate=...&endDate=...
router.get("/revenue/categories", reportController.getRevenueByCategory);

// -------------------------------------------------------
//  Products
// -------------------------------------------------------
// GET /api/reports/top-products
// Query: ?limit=10&startDate=...&endDate=...
router.get("/top-products", reportController.getTopProducts);

// -------------------------------------------------------
//  Orders
// -------------------------------------------------------
// GET /api/reports/orders/status
// Query: ?startDate=...&endDate=...
router.get("/orders/status", reportController.getOrderStatusBreakdown);

// -------------------------------------------------------
//  Payouts
// -------------------------------------------------------
// GET /api/reports/payouts/stats
router.get("/payouts/stats", reportController.getPayoutStats);

// GET /api/reports/payouts/by-shop
// Query: ?shopId=1
router.get("/payouts/by-shop", reportController.getPayoutByShop);

// GET /api/reports/payouts
// Query: ?status=pending&startDate=...&endDate=...
router.get("/payouts", reportController.getPayoutSummary);

module.exports = router;