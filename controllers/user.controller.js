const userService = require('../services/user.service');
const ApiError = require('../utils/ApiError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserById = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.params.id, req.body);
    res.json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};