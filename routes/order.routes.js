const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validation.middleware');
const Joi = require('joi');

// Schema validasi untuk order
const orderSchema = Joi.object({
  body: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    ).min(1).required()
  }).required(),
  params: Joi.object({}),
  query: Joi.object({})
});

router.use(authenticate);

router.post('/', validate(orderSchema), orderController.createOrder);

router.get('/history', orderController.getOrderHistory);

router.get('/:id', orderController.getOrderDetails);

router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;