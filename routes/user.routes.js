const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const Joi = require('joi');

// Schema validasi untuk update profile
const updateProfileSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3),
    email: Joi.string().email(),
    password: Joi.string().min(6)
  }).min(1),
  params: Joi.object({}),
  query: Joi.object({}) 
});

// Admin-only routes
router.get(
  '/',
  authenticate,
  authorize(['admin']),
  userController.getAllUsers
);

// User profile routes (untuk semua user yang terautentikasi)
router.get(
  '/me',
  authenticate,
  userController.getUserProfile
);

router.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  userController.updateUserProfile
);

// Admin-only user management
router.get(
  '/:id',
  authenticate,
  authorize(['admin']),
  userController.getUserById
);

router.patch(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(updateProfileSchema),
  userController.updateUserById
);

router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  userController.deleteUser
);

module.exports = router;