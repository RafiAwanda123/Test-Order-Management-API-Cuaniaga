const { sequelize, User, Order, OrderItem, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const productService = require('./product.service');

class OrderService {
  async createOrder(userId, items) {
    // 1. Validasi user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // 2. Hanya customer yang bisa membuat pesanan
    if (user.role !== 'customer') {
      throw new ApiError(403, 'Hanya customer yang dapat membuat pesanan');
    }
    
    // 3. Validasi items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Pesanan harus memiliki minimal satu item');
    }
    
    // 4. Proses dalam transaksi database
    return sequelize.transaction(async (transaction) => {
      let total = 0;
      const orderItems = [];
      
      // 5. Proses setiap item
      for (const item of items) {
        // Validasi item
        if (!item.productId || isNaN(item.productId)) {
          throw new ApiError(400, 'Product ID tidak valid');
        }
        
        if (!item.quantity || item.quantity <= 0) {
          throw new ApiError(400, 'Kuantitas harus lebih dari 0');
        }
        
        // Dapatkan produk dengan lock untuk menghindari race condition
        const product = await Product.findByPk(item.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        
        if (!product) {
          throw new ApiError(404, `Produk ID ${item.productId} tidak ditemukan`);
        }
        
        // Validasi stok cukup
        if (product.stock < item.quantity) {
          throw new ApiError(400, `Stok tidak cukup untuk produk ${product.name}`);
        }
        
        // Hitung subtotal
        const subtotal = product.price * item.quantity;
        total = Number((total + subtotal).toFixed(2));
        
        // Kurangi stok menggunakan service produk
        await productService.decrementStock(
          product.id, 
          item.quantity, 
          transaction
        );
        
        // Siapkan order item
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          subtotal
        });
      }
      
      // 6. Buat order
      const order = await Order.create({
        userId,
        total,
        status: 'pending' // Status awal harus pending
      }, { transaction });
      
      // 7. Tambahkan orderId ke setiap item
      const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        orderId: order.id
      }));
      
      // 8. Simpan order items
      await OrderItem.bulkCreate(itemsWithOrderId, { transaction });
      
      // 9. Dapatkan order lengkap untuk response
      const fullOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product'
                // attributes: ['id', 'name', 'description', 'price']
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
    // Validasi user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Dapatkan riwayat pesanan
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
    // Validasi input
    if (!orderId || isNaN(orderId)) {
      throw new ApiError(400, 'Order ID tidak valid');
    }
    
    if (!userId || isNaN(userId)) {
      throw new ApiError(400, 'User ID tidak valid');
    }
    
    // Dapatkan detail pesanan
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
    // Validasi input
    if (!orderId || isNaN(orderId)) {
      throw new ApiError(400, 'Order ID tidak valid');
    }
    
    if (!userId || isNaN(userId)) {
      throw new ApiError(400, 'User ID tidak valid');
    }
    
    return sequelize.transaction(async (transaction) => {
      // 1. Dapatkan pesanan lengkap dengan items
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
      
      // 2. Validasi status pesanan
      if (order.status !== 'pending') {
        throw new ApiError(400, 'Hanya pesanan pending yang dapat dibatalkan');
      }
      
      // 3. Kembalikan stok produk
      for (const item of order.items) {
        await productService.incrementStock(
          item.productId,
          item.quantity,
          transaction
        );
      }
      
      // 4. Update status pesanan
      order.status = 'cancelled';
      await order.save({ transaction });
      
      return order;
    });
  }
}

module.exports = new OrderService();