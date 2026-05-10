const reportService = require('../services/reportService');

const getReports = async (req, res, next) => {
  try {
    const data = await reportService.getReports();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getReports
};
