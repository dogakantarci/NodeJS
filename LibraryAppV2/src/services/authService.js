// src/services/authService.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (userData) => {
    const user = new User(userData);
    await user.save();
    return generateToken(user._id);
};

exports.login = async (username, password) => {
    const user = await User.findOne({ username });
    if (user && await user.comparePassword(password)) {
        return generateToken(user._id);
    } else {
        throw new Error('Invalid username or password');
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
