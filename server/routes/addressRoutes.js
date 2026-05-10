const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams เพื่อรับ :userId จาก app.js
const addressController = require('../controllers/addressController');

// GET /users/:userId/addresses
// GET /users/:userId/addresses/:addressId

router.get('/',            addressController.getAddressesByUser);
router.get('/:addressId',  addressController.getAddressById);

module.exports = router;