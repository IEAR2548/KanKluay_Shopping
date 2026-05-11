const express = require("express");
const router = express.Router();
const orderController = require('../controllers/orderController');

// Specific routes MUST come before /:id to avoid Express matching "user"/"shop" as an order ID
router.get('/user/:userId',   orderController.getOrdersByUser);
router.get('/shop/:shopId',   orderController.getOrdersByShop);

router.get('/',               orderController.getAllOrders);
router.get('/:id',            orderController.getOrderById);
router.post('/',              orderController.createOrder);
router.patch('/:id/status',   orderController.updateOrderStatus);
router.delete('/:id',         orderController.deleteOrder);

module.exports = router;