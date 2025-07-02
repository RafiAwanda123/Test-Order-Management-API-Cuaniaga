const orderService = require('../services/order.service');
const ApiError = require('../utils/ApiError');

// exports.createOrder = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const items = req.body.items;
    
//     // Validasi item
//     if (!items || !Array.isArray(items) || items.length === 0) {
//       throw new ApiError(400, 'Item pesanan tidak valid');
//     }
    
//     // Panggil service untuk membuat pesanan
//     const newOrder = await orderService.createOrder(userId, items);
    
//     // Kirim response
//     res.status(201).json({
//       status: 'success',
//       data: newOrder
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.createOrder = async (req, res, next) => {
  try {
    console.log('User dari token:', req.user);
    
    const userId = req.user.id;
    const items = req.body.items;
    
    // Log user ID yang akan digunakan
    console.log(`Membuat order untuk user ID: ${userId}`);
    
    // Validasi item
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Item pesanan tidak valid');
    }
    
    // Panggil service untuk membuat pesanan
    const newOrder = await orderService.createOrder(userId, items);
    
    // Kirim response
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
    
    // Panggil service untuk mendapatkan riwayat pesanan
    const orders = await orderService.getOrderHistory(userId);
    
    // Kirim response
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
    
    // Panggil service untuk mendapatkan detail pesanan
    const order = await orderService.getOrderDetails(orderId, userId);
    
    // Kirim response
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
    
    // Panggil service untuk membatalkan pesanan
    const canceledOrder = await orderService.cancelOrder(orderId, userId);
    
    // Kirim response
    res.json({
      status: 'success',
      data: canceledOrder
    });
  } catch (error) {
    next(error);
  }
};