const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/db');
const User = require('../models/User')(sequelize); // Kullanıcı modelini ekleyin

// Hata mesajlarını düzenlemek için özel bir fonksiyon
const handleTokenError = (error, res) => {
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Not authorized, token failed' });
};

exports.authenticateUser = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı almak
            token = req.headers.authorization.split(' ')[1];

            // Token'ı doğrulama
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Kullanıcıyı bulma
            const user = await User.findByPk(decoded.id, {
                attributes: ['id', 'username'], // Sadece gereken alanları seç
            });

            // Kullanıcı bulunamazsa
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            req.user = user; // Kullanıcıyı `req` objesine ata
            next();
        } catch (error) {
            // Token doğrulama hatalarını işle
            console.error('Token Error:', error);
            return handleTokenError(error, res);
        }
    } else {
        // Token yoksa
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
