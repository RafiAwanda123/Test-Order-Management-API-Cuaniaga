const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const authenticate = (req, res, next) => {
  try {
    // 1. Ambil token dari header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    // 2. Ekstrak token
    const token = authHeader.split(' ')[1];
    
    // 3. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. PERBAIKAN: Gunakan decoded.id bukan decoded.userId
    req.user = {
      id: decoded.id, 
      role: decoded.role,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    // 5. Handle error spesifik JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token kadaluarsa' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token tidak valid' });
    }
    
    // 6. Error umum
    res.status(401).json({ error: 'Autentikasi gagal' });
  }
};

module.exports = authenticate;
