const productService = require('../services/product.service');
const ApiError = require('../utils/ApiError');

exports.createProduct = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Akses ditolak');
    }
    
    const newProduct = await productService.createProduct(req.body);
    
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
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Akses ditolak');
    }
    
    const productId = req.params.id;
    const updateData = req.body;
    
    const updatedProduct = await productService.updateProduct(productId, updateData);

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
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Akses ditolak');
    }
    
    const productId = req.params.id;

    await productService.deleteProduct(productId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    
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
    
    const product = await productService.getProductById(productId);
    
    res.json({
      status: 'success',
      data: product
    });
  } catch (error) {
    next(error);
  }
};