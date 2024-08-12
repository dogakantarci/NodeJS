// src/services/bookService.js
const Book = require('../models/Book');

exports.getAllBooks = async () => {
    return await Book.find();
};

// Diğer CRUD işlemleri de buraya eklenir
