// src/controllers/bookController.js
const Book = require('../models/Book');

// Kitapları alma
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Kitapları alma hatası' });
    }
};

// Belirli bir kitabı alma
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Kitap alma hatası' });
    }
};

// Yeni kitap oluşturma
exports.createBook = async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ message: 'Kitap oluşturma hatası' });
    }
};

// Kitap güncelleme
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(400).json({ message: 'Kitap güncelleme hatası' });
    }
};

// Kitap silme
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }
        res.status(200).json({ message: 'Kitap silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Kitap silme hatası' });
    }
};
