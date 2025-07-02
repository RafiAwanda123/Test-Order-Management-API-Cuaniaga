const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

class AuthService {
  async register(name, email, password, role = 'customer') {
    try {
      console.log('Starting registration for:', email);
      
      // 1. Cek email unik
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.log('Email already exists:', email);
        throw new ApiError(400, 'Email already registered');
      }

      if (role !== 'admin') {
      const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          throw new ApiError(400, 'Email already registered');
        }
      }
      
      if (!password || password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed');

      // 3. Buat user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      console.log('User created:', newUser.id);

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      // 4. Generate token
      const token = jwt.sign(
        {
          id: newUser.id,
          role: newUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token
      };
      
    } catch (error) {
      console.error('AuthService.register error:', error);
      
      // Tangani error spesifik
      if (error.message.includes('JWT_SECRET')) {
        throw new ApiError(500, 'Server configuration error');
      }
      
      throw new ApiError(500, 'Registration failed', error.errors || []);
    }
  }

  async registerAdmin(name, email, password, role = 'admin') {
    try {
      console.log('Starting registration for:', email);
      
      // 1. Cek email unik
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.log('Email already exists:', email);
        throw new ApiError(400, 'Email already registered');
      }

      if (role !== 'admin') {
      const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          throw new ApiError(400, 'Email already registered');
        }
      }
      
      if (!password || password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed');

      // 3. Buat user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      console.log('User created:', newUser.id);

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }

      // 4. Generate token
      const token = jwt.sign(
        {
          id: newUser.id,
          role: newUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token
      };
      
    } catch (error) {
      console.error('AuthService.register error:', error);
      
      if (error.message.includes('JWT_SECRET')) {
        throw new ApiError(500, 'Server configuration error');
      }
      
      throw new ApiError(500, 'Registration failed', error.errors || []);
    }
  }
  
  async login(email, password) {
    // 1. Cari user termasuk password
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'name', 'email', 'password', 'role']
    });
    
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // 2. Verifikasi password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // 3. Generate tokens
    const accessToken = this.generateToken(user, 'access');
    const refreshToken = this.generateToken(user, 'refresh');

    // 4. Return data user tanpa password
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return {
      user: userData,
      token: accessToken,
      refreshToken
    };
  }

  // async getProfile(userId) {
  //   const user = await User.findByPk(userId, {
  //     attributes: ['id', 'name', 'email', 'role', 'createdAt']
  //   });
    
  //   if (!user) {
  //     throw new ApiError(404, 'User not found');
  //   }
    
  //   return user;
  // }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'role']
      });
      
      if (!user) {
        throw new ApiError(401, 'Invalid user');
      }
      
      return {
        accessToken: this.generateToken(user, 'access')
      };
    } catch (error) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  generateToken(user, type = 'access') {
  // Validasi secret
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const payload = {
    id: user.id,
    role: user.role
  };
  
  const options = {
    expiresIn: '1d'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}
}

module.exports = new AuthService();
