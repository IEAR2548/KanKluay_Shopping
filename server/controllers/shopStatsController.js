const shopStatsService = require('../services/shopStatsService');

// GET /shops/:shopId/stats
async function getShopStats(req, res, next) {
  try {
    const { shopId } = req.params;
    const [stats, weekly] = await Promise.all([
      shopStatsService.getShopStats(shopId),
      shopStatsService.getWeeklySales(shopId),
    ]);
    res.json({ data: { stats, weekly } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getShopStats };