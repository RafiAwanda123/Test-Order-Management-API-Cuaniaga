const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id: decoded.id, 
      role: decoded.role,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token kadaluarsa' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }
    
    res.status(401).json({ error: 'Autentikasi gagal' });
  }
};

module.exports = authenticate;
