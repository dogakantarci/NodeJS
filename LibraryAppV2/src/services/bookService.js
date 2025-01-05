
// src/services/bookService.js
const Book = require('../models/Book');

exports.getAllBooks = async () => {
    try {
        const books = await Book.findAll();  // Sequelize'de findAll kullanılır
        return books;
    } catch (error) {
        throw new Error('Kitapları alırken bir hata oluştu');
    }
};

exports.getBookById = async (id) => {
    try {
        const book = await Book.findByPk(id);  // Sequelize'de findByPk kullanılır
        if (!book) {
            throw new Error('Kitap bulunamadı');
        }
        return book;
    } catch (error) {
        throw new Error('Kitap alma sırasında bir hata oluştu');
    }
};

exports.createBook = async (bookData) => {
    try {
        const book = await Book.create(bookData);  // Sequelize'de create kullanılır
        return book;
    } catch (error) {
        throw new Error('Kitap oluşturulurken bir hata oluştu');
    }
};

exports.updateBook = async (id, bookData) => {
    try {
        const book = await Book.findByPk(id);
        if (!book) {
            throw new Error('Kitap bulunamadı');
        }
        await book.update(bookData);  // Sequelize'de update kullanılır
        return book;
    } catch (error) {
        throw new Error('Kitap güncellenirken bir hata oluştu');
    }
};

exports.deleteBook = async (id) => {
    try {
        const book = await Book.findByPk(id);
        if (!book) {
            throw new Error('Kitap bulunamadı');
        }
        await book.destroy();  // Sequelize'de destroy kullanılır
        return book;
    } catch (error) {
        throw new Error('Kitap silinirken bir hata oluştu');
    }
};
