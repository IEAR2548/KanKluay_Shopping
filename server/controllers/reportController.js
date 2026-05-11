// server/controllers/reportController.js
const reportService = require("../services/reportService");

// ============================================================
//  GET /api/reports/summary
//  Query: ?startDate=2024-01-01&endDate=2024-12-31
// ============================================================
const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await reportService.getSummary({ startDate, endDate });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/reports/revenue/daily
//  Query: ?startDate=2024-01-01&endDate=2024-01-31  (required)
// ============================================================
const getDailyRevenue = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }
    const data = await reportService.getDailyRevenue({ startDate, endDate });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/reports/revenue/monthly
//  Query: ?year=2024
// ============================================================
const getMonthlyRevenue = async (req, res, next) => {
  try {
    const { year } = req.query;
    const data = await reportService.getMonthlyRevenue({ year });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/reports/top-products
//  Query: ?limit=10&startDate=...&endDate=...
// ============================================================
const getTopProducts = async (req, res, next) => {
  try {
    const { limit, startDate, endDate } = req.query;
    const data = await reportService.getTopProducts({
      limit: limit ? parseInt(limit) : 10,
      startDate,
      endDate,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/reports/revenue/shops
//  Query: ?limit=20&startDate=...&endDate=...
// ============================================================
const getRevenueByShop = async (req, res, next) => {
  try {
    const { limit, startDate, endDate } = req.query;
    const data = await reportService.getRevenueByShop({
      limit: limit ? parseInt(limit) : 20,
      startDate,
      endDate,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/reports/payouts
//  Query: ?status=pending&startDate=...&endDate=...
// ============================================================
const getPayoutSummary = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const data = await reportService.getPayoutSummary({
      status,
      startDate,
      endDate,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/reports/payouts/stats
// ============================================================
const getPayoutStats = async (req, res, next) => {
  try {
    const data = await reportService.getPayoutStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/reports/payouts/by-shop
//  Query: ?shopId=1  (optional — ถ้าไม่ส่งจะดึงทุกร้าน)
// ============================================================
const getPayoutByShop = async (req, res, next) => {
  try {
    const { shopId } = req.query;
    const data = await reportService.getPayoutByShop({
      shopId: shopId ? parseInt(shopId) : undefined,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/reports/revenue/categories
//  Query: ?startDate=...&endDate=...
// ============================================================
const getRevenueByCategory = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await reportService.getRevenueByCategory({ startDate, endDate });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /api/reports/orders/status
//  Query: ?startDate=...&endDate=...
// ============================================================
const getOrderStatusBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await reportService.getOrderStatusBreakdown({
      startDate,
      endDate,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
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