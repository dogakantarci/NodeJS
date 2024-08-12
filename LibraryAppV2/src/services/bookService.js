// src/services/bookService.js
const Book = require('../models/Book');

exports.getAllBooks = async () => {
    return await Book.find();
};

exports.getBookById = async (id) => {
    return await Book.findById(id);
};

exports.createBook = async (bookData) => {
    const book = new Book(bookData);
    return await book.save();
};

exports.updateBook = async (id, bookData) => {
    return await Book.findByIdAndUpdate(id, bookData, { new: true, runValidators: true });
};

exports.deleteBook = async (id) => {
    return await Book.findByIdAndDelete(id);
};
