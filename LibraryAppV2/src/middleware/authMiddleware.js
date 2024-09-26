// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Kullanıcı modelini ekleyin

// Hata mesajlarını düzenlemek için özel bir fonksiyon
const handleTokenError = (error, res) => {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  };

exports.authenticateUser = async (req, res, next) => {
    let token;

      // Çevresel değişken kontrolü
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT secret is not defined." });
  }


    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı almak
            token = req.headers.authorization.split(' ')[1];

            // Token'ı doğrulama
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Kullanıcıyı bulma
            req.user = await User.findById(decoded.id).select('-password');

            // Kullanıcı bulunamazsa
            if (!req.user) {
                return res.status(404).json({ message: 'User not found' });
      }


            next();
    }       catch (error) {
            // Token doğrulama hatalarını işle
            console.error(error);
            return handleTokenError(error, res);
    }
  } else {
    // Token yoksa
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};