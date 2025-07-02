const orderService = require('../services/order.service');
const ApiError = require('../utils/ApiError');

exports.createOrder = async (req, res, next) => {
  try {
    console.log('User dari token:', req.user);
    
    const userId = req.user.id;
    const items = req.body.items;
    
    console.log(`Membuat order untuk user ID: ${userId}`);
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Item pesanan tidak valid');
    }
    
    const newOrder = await orderService.createOrder(userId, items);
    
    res.status(201).json({
      status: 'success',
      data: newOrder
    });
  } catch (error) {
    console.error('Error di order controller:', error);
    next(error);
  }
};

exports.getOrderHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const orders = await orderService.getOrderHistory(userId);
    
    res.json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    
    const order = await orderService.getOrderDetails(orderId, userId);

    res.json({
      status: 'success',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const canceledOrder = await orderService.cancelOrder(orderId, userId);

    res.json({
      status: 'success',
      data: canceledOrder
    });
  } catch (error) {
    next(error);
  }
};