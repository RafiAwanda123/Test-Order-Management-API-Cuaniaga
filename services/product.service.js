const { Product } = require('../models');
const ApiError = require('../utils/ApiError');

class ProductService {
  async createProduct(productData) {
    if (productData.price < 0) {
      throw new ApiError(400, 'Harga tidak boleh negatif');
    }
    
    if (productData.stock < 0) {
      throw new ApiError(400, 'Stok tidak boleh negatif');
    }
    
    return Product.create(productData);
  }

  async updateProduct(productId, updateData) {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new ApiError(404, 'Produk tidak ditemukan');
    }
    
    if (updateData.stock !== undefined && updateData.stock < 0) {
      throw new ApiError(400, 'Stok tidak boleh negatif');
    }
    
    if (updateData.price !== undefined && updateData.price < 0) {
      throw new ApiError(400, 'Harga tidak boleh negatif');
    }
    
    return product.update(updateData);
  }

  async deleteProduct(productId) {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new ApiError(404, 'Produk tidak ditemukan');
    }
    
    // Aturan bisnis: Produk dengan stok > 0 tidak bisa dihapus?
    // if (product.stock > 0) {
    //   throw new ApiError(400, 'Produk dengan stok tersedia tidak dapat dihapus');
    // }
    
    return product.destroy();
  }

  async getProductById(productId) {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new ApiError(404, 'Produk tidak ditemukan');
    }
    return product;
  }

  async getAllProducts() {
    return Product.findAll();
  }

  async decrementStock(productId, quantity, transaction) {
    const product = await Product.findByPk(productId, { transaction });
    
    if (!product) {
      throw new ApiError(404, 'Produk tidak ditemukan');
    }
    
    if (product.stock < quantity) {
      throw new ApiError(400, `Stok tidak cukup untuk produk ${product.name}`);
    }
    
    product.stock -= quantity;
    return product.save({ transaction });
  }
}

module.exports = new ProductService();