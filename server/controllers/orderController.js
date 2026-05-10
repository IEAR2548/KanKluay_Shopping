const orderService = require('../services/orderService');

const getAllOrders = async (req, res, next) => {
  try {
    const { rows } = await orderService.getAllOrders();
    res.json({ data: rows });
  } catch (err) { next(err); }
};

const getOrderById = async (req, res, next) => {
  try {
    const result = await orderService.getOrderById(req.params.id);
    if (!result.order) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: result });
  } catch (err) { next(err); }
};

const getOrdersByUser = async (req, res, next) => {
  try {
    const { rows } = await orderService.getOrdersByUser(req.params.userId);
    res.json({ data: rows });
  } catch (err) { next(err); }
};

const getOrdersByShop = async (req, res, next) => {
  try {
    const { rows } = await orderService.getOrdersByShop(req.params.shopId);
    res.json({ data: rows });
  } catch (err) { next(err); }
};

const createOrder = async (req, res, next) => {
  try {
    const { user_id, shop_id, address_id, payment_method, items } = req.body;
    if (!user_id || !shop_id || !address_id || !items?.length)
      return res.status(400).json({ error: 'user_id, shop_id, address_id, items are required' });
    const order = await orderService.createOrder(user_id, shop_id, address_id, payment_method, items);
    res.status(201).json({ data: order });
  } catch (err) {
    if (err.message.includes('insufficient stock'))
      return res.status(400).json({ error: err.message });
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { order_status, shipping_status } = req.body;

    if (order_status && !['pending', 'completed', 'cancelled'].includes(order_status))
      return res.status(400).json({ error: 'order_status must be pending | completed | cancelled' });

    if (shipping_status && !['shipping', 'delivered', 'returned'].includes(shipping_status))
      return res.status(400).json({ error: 'shipping_status must be shipping | delivered | returned' });

    const { rows } = await orderService.updateOrderStatus(req.params.id, order_status, shipping_status);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: rows[0] });
  } catch (err) { next(err); }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { rows } = await orderService.deleteOrder(req.params.id);
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: { message: 'Order deleted', order_id: rows[0].order_id } });
  } catch (err) { next(err); }
};

module.exports = {
  getAllOrders, getOrderById, getOrdersByUser, getOrdersByShop,
  createOrder, updateOrderStatus, deleteOrder,
};