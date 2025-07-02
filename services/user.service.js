const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');

class UserService {
  async getAllUsers() {
    return User.findAll({
      attributes: { exclude: ['password'] }
    });
  }

  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    return user;
  }

  async updateUserProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Validasi email unik jika diupdate
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: updateData.email } });
      if (existingUser) {
        throw new ApiError(400, 'Email already in use');
      }
    }
    
    // Enkripsi password jika diupdate
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    await user.update(updateData);
    
    // Kembalikan data tanpa password
    const updatedUser = user.get({ plain: true });
    delete updatedUser.password;
    
    return updatedUser;
  }

  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Aturan bisnis: Admin tidak bisa menghapus diri sendiri?
    // if (req.user.id === userId) {
    //   throw new ApiError(400, 'Cannot delete your own account');
    // }
    
    return user.destroy();
  }
}

module.exports = new UserService();