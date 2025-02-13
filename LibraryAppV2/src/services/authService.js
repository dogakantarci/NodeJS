// src/services/authService.js
const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (userData) => {
    const user = await User.create(userData); // Yeni kullanıcıyı kaydet
    return generateToken(user.id);  // Kullanıcı ID'si ile token oluştur
};

exports.login = async (username, password) => {
    const user = await User.findOne({ where: { username } });  // Kullanıcıyı username ile bul
    if (user && await user.comparePassword(password)) {  // Şifreyi doğrula
        return generateToken(user.id);  // Geçerli kullanıcıyı JWT ile token oluştur
    } else {
        throw new Error('Invalid username or password');
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
