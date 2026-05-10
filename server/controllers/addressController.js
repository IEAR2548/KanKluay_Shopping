const addressService = require('../services/addressService');

// GET /users/:userId/addresses
async function getAddressesByUser(req, res, next) {
  try {
    const { userId } = req.params;
    const data = await addressService.getAddressesByUser(userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// GET /users/:userId/addresses/:addressId
async function getAddressById(req, res, next) {
  try {
    const { addressId } = req.params;
    const data = await addressService.getAddressById(addressId);
    res.json({ data });
  } catch (err) {
    if (err.message.includes('ไม่พบ')) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = { getAddressesByUser, getAddressById };