const productService = require('../services/product.service');
const ApiError = require('../utils/ApiError');

exports.createProduct = async (req, res, next) => {
  try {
    // Hanya admin yang bisa membuat produk
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Akses ditolak');
    }
    
    // Panggil service untuk membuat produk
    const newProduct = await productService.createProduct(req.body);
    
    // Kirim response
    res.status(201).json({
      status: 'success',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    // Hanya admin yang bisa update produk
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Akses ditolak');
    }
    
    const productId = req.params.id;
    const updateData = req.body;
    
    // Panggil service untuk update produk
    const updatedProduct = await productService.updateProduct(productId, updateData);
    
    // Kirim response
    res.json({
      status: 'success',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    // Hanya admin yang bisa hapus produk
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Akses ditolak');
    }
    
    const productId = req.params.id;
    
    // Panggil service untuk hapus produk
    await productService.deleteProduct(productId);
    
    // Kirim response
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    // Dapatkan semua produk (bisa diakses semua user)
    const products = await productService.getAllProducts();
    
    // Kirim response
    res.json({
      status: 'success',
      data: products
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Dapatkan produk berdasarkan ID
    const product = await productService.getProductById(productId);
    
    // Kirim response
    res.json({
      status: 'success',
      data: product
    });
  } catch (error) {
    next(error);
  }
};