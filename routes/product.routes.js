const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const Joi = require('joi');

const createProductSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().allow(''),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).default(0)
  }).required(),
  params: Joi.object({}).empty(), // Pastikan tidak ada params
  query: Joi.object({})
});

const updateProductSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).optional(),
    description: Joi.string().allow('').optional(),
    price: Joi.number().min(0).optional(),
    stock: Joi.number().integer().min(0).default(0).optional()
  }).min(1), 
  params: Joi.object({
    id: Joi.string().pattern(/^\d+$/).required()
  }),
  query: Joi.object({})
});

const deleteProductSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^\d+$/).required()
  }),
  body: Joi.forbidden(),
  query: Joi.object({})
});

router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(deleteProductSchema),
  productController.deleteProduct
);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;