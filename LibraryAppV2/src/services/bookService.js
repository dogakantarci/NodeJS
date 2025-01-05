
// src/services/bookService.js
const Book = require('../models/Book');

exports.getAllBooks = async () => {
    try {
        const books = await Book.findAll();
        return books;
    } catch (error) {
        throw new Error(`Kitapları alırken bir hata oluştu: ${error.message}`);
    }
};

exports.getBookById = async (id) => {
    try {
        const book = await Book.findByPk(id);
        if (!book) {
            throw new Error('Kitap bulunamadı');
        }
        return book;
    } catch (error) {
        throw new Error(`Kitap alma sırasında bir hata oluştu: ${error.message}`);
    }
};

exports.createBook = async (bookData) => {
    try {
        const book = await Book.create(bookData);
        return book;
    } catch (error) {
        throw new Error(`Kitap oluşturulurken bir hata oluştu: ${error.message}`);
    }
};

exports.updateBook = async (id, bookData) => {
    try {
        const book = await Book.findByPk(id);
        if (!book) {
            throw new Error('Kitap bulunamadı');
        }
        await book.update(bookData);
        return book;
    } catch (error) {
        throw new Error(`Kitap güncellenirken bir hata oluştu: ${error.message}`);
    }
};

exports.deleteBook = async (id) => {
    try {
        const book = await Book.findByPk(id);
        if (!book) {
            throw new Error('Kitap bulunamadı');
        }
        await book.destroy();
        return book;
    } catch (error) {
        throw new Error(`Kitap silinirken bir hata oluştu: ${error.message}`);
    }
};
