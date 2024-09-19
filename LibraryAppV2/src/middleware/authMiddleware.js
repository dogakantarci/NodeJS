// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Kullanıcı modelini ekleyin

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı almak
            token = req.headers.authorization.split(' ')[1];

            // Token'ı doğrulama
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Kullanıcıyı bulma
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};