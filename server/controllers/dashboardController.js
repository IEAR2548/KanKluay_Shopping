// server/controllers/dashboardController.js
const dashboardService = require("../services/dashboardService");

// ============================================================
//  GET /dashboard/summary
// ============================================================
const getSummaryCards = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummaryCards();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /dashboard/trend
//  Query: ?range=lastWeek | lastMonth
// ============================================================
const getTransactionsTrend = async (req, res, next) => {
  try {
    const { range } = req.query;
    const data = await dashboardService.getTransactionsTrend({ range });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /dashboard/sub-metrics
// ============================================================
const getSubMetrics = async (req, res, next) => {
  try {
    const data = await dashboardService.getSubMetrics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /dashboard/recent-users
// ============================================================
const getRecentUsers = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentUsers();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /dashboard/top-shops
//  Query: ?limit=5
// ============================================================
const getTopShops = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const data = await dashboardService.getTopShops({
      limit: limit ? parseInt(limit) : 5,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ============================================================
//  GET /dashboard/growth
// ============================================================
const getGrowthStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getGrowthStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummaryCards,
  getTransactionsTrend,
  getSubMetrics,
  getRecentUsers,
  getTopShops,
  getGrowthStats,
};