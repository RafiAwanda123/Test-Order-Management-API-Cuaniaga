const { sequelize, User, Order, OrderItem, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const productService = require('./product.service');

class OrderService {
  async createOrder(userId, items) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    if (user.role !== 'customer') {
      throw new ApiError(403, 'Hanya customer yang dapat membuat pesanan');
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Pesanan harus memiliki minimal satu item');
    }
    
    return sequelize.transaction(async (transaction) => {
      let total = 0;
      const orderItems = [];
      
      for (const item of items) {
        if (!item.productId || isNaN(item.productId)) {
          throw new ApiError(400, 'Product ID tidak valid');
        }
        
        if (!item.quantity || item.quantity <= 0) {
          throw new ApiError(400, 'Kuantitas harus lebih dari 0');
        }
        
        const product = await Product.findByPk(item.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        
        if (!product) {
          throw new ApiError(404, `Produk ID ${item.productId} tidak ditemukan`);
        }
        
        if (product.stock < item.quantity) {
          throw new ApiError(400, `Stok tidak cukup untuk produk ${product.name}`);
        }
        
        const subtotal = product.price * item.quantity;
        total = Number((total + subtotal).toFixed(2));
        
        await productService.decrementStock(
          product.id, 
          item.quantity, 
          transaction
        );
        
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          subtotal
        });
      }
      
      const order = await Order.create({
        userId,
        total,
        status: 'pending'
      }, { transaction });
      
      const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        orderId: order.id
      }));
      
      await OrderItem.bulkCreate(itemsWithOrderId, { transaction });
      
      const fullOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'description', 'price']
              }
            ]
          }
        ],
        transaction
      });
      
      return fullOrder;
    });
  }

  async getOrderHistory(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return orders;
  }

  async getOrderDetails(orderId, userId) {
    if (!orderId || isNaN(orderId)) {
      throw new ApiError(400, 'Order ID tidak valid');
    }
    
    if (!userId || isNaN(userId)) {
      throw new ApiError(400, 'User ID tidak valid');
    }
    
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'description', 'price', 'stock']
            }
          ]
        }
      ]
    });
    
    if (!order) {
      throw new ApiError(404, 'Pesanan tidak ditemukan');
    }
    
    return order;
  }

  async cancelOrder(orderId, userId) {
    if (!orderId || isNaN(orderId)) {
      throw new ApiError(400, 'Order ID tidak valid');
    }
    
    if (!userId || isNaN(userId)) {
      throw new ApiError(400, 'User ID tidak valid');
    }
    
    return sequelize.transaction(async (transaction) => {
      const order = await Order.findOne({
        where: { id: orderId, userId },
        include: [
          {
            model: OrderItem,
            as: 'items'
          }
        ],
        transaction
      });
      
      if (!order) {
        throw new ApiError(404, 'Pesanan tidak ditemukan');
      }

      if (order.status !== 'pending') {
        throw new ApiError(400, 'Hanya pesanan pending yang dapat dibatalkan');
      }

      for (const item of order.items) {
        await productService.incrementStock(
          item.productId,
          item.quantity,
          transaction
        );
      }

      order.status = 'cancelled';
      await order.save({ transaction });
      
      return order;
    });
  }
}

module.exports = new OrderService();