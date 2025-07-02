const authService = require('../services/auth.service');
const ApiError = require('../utils/ApiError');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (role === 'admin') {
      if (!req.user || req.user.role !== 'admin') {
        throw new ApiError(403, 'Only admins can create admin accounts');
      }
    }

    const userResponse = await authService.register(name, email, password, role);
    
    res.status(201).json({
      status: 'success',
      data: userResponse
    });

  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validasi input sudah di middleware, langsung proses
    const { user, token } = await authService.login(email, password);

    // Set cookie untuk autentikasi yang lebih aman
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
      sameSite: 'strict'
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    next(error);
  }
};

exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    const userResponse = await authService.register(name, email, password, role);
    
    res.status(201).json({
      status: 'success',
      data: userResponse
    });

  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({
    status: 'success',
    message: 'Logout successful'
  });
};

// exports.getProfile = async (req, res, next) => {
//   try {
//     // Dapatkan user dari request (setelah autentikasi middleware)
//     const userId = req.user.id;
    
//     const userProfile = await authService.getProfile(userId);
    
//     res.json({
//       status: 'success',
//       data: userProfile
//     });
//   } catch (error) {
//     console.error('Profile error:', error.message);
//     next(error);
//   }
// };

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token required');
    }
    
    const { accessToken } = await authService.refreshToken(refreshToken);
    
    res.json({
      status: 'success',
      data: { accessToken }
    });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    next(error);
  }
};