const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validation.middleware');
const authorize = require('../middleware/role.middleware');
const Joi = require('joi');

// Schema validasi untuk login
const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }).required(),
  params: Joi.object({}),
  query: Joi.object({})
});

// Schema validasi untuk register
const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'customer').default('customer')
  }).required(),
  params: Joi.object({}),
  query: Joi.object({})
});

// Endpoint login
router.post('/login', validate(loginSchema), authController.login);

// Endpoint register publik
router.post('/register', validate(registerSchema), authController.register);

// Endpoint register admin (hanya untuk admin)
router.post('/admin/register', 
  authorize(['admin']),
  validate(registerSchema),
  authController.registerAdmin
);

// // Endpoint get profile
// router.get('/profile', auth, authController.getProfile);

module.exports = router;