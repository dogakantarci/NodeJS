const BookService = require('../services/bookService');
const { addLog } = require('../services/elasticsearchService');
const mongoose = require('mongoose');
const { search } = require('../services/elasticsearchService'); // Doğru bir şekilde içe aktarılmalı

exports.getAllBooks = async (req, res) => {
    try {
        const books = await BookService.getAllBooks();
        res.status(200).json(books);

        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: 'All books fetched successfully',
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kitapları alma hatası', error: error.message });
        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: `Error fetching books: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

exports.getBookById = async (req, res) => {
    const { id } = req.params;

    // Geçersiz ID kontrolü
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Geçersiz ID: Kitap bulunamadı' });
    }

    try {
        const book = await BookService.getBookById(id);
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }
        res.status(200).json(book);
        await addLog({
            id: `getBookById-${Date.now()}`,
            message: `Book with ID ${id} fetched successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Bir hata oluştu', error: error.message });
        await addLog({
            id: `getBookById-${Date.now()}`,
            message: `Error fetching book with ID ${req.params.id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

exports.createBook = async (req, res) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: 'Tüm alanlar gereklidir: title, author, publishedDate' });
    }

    try {
        const book = await BookService.createBook(req.body);
        res.status(201).json(book);
        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Book with ID ${book._id} created successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Kitap oluşturma hatası', error: error.message });
        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Error creating book: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

exports.updateBook = async (req, res) => {
    const { id } = req.params;

    try {
        const book = await BookService.updateBook(id, req.body);
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }

        res.status(200).json(book);
        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `Book with ID ${book._id} updated successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            res.status(400).json({ message: 'Geçersiz veri formatı', error: error.message });
        } else {
            res.status(500).json({ message: 'Sunucu hatası', error: error.message });
        }

        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `Error updating book with ID ${req.params.id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

exports.deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        const book = await BookService.deleteBook(id);
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }

        res.status(204).json({ message: 'Kitap silindi' });
        await addLog({
            id: `deleteBook-${Date.now()}`,
            message: `Book with ID ${req.params.id} deleted successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kitap silme hatası', error: error.message });
        await addLog({
            id: `deleteBook-${Date.now()}`,
            message: `Error deleting book with ID ${req.params.id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

// Arama işlemi için
exports.searchBooks = async (req, res) => {
    const query = req.query.q; // Arama sorgusunu almak için

    // Arama sorgusunun geçerliliğini kontrol et
    if (!query) {
        return res.status(400).json({ message: 'Arama sorgusu gereklidir' });
    }

    try {
        const results = await search(query);
        res.status(200).json(results);

        await addLog({
            id: `searchBooks-${Date.now()}`,
            message: `Search performed with query: ${query}`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Arama hatası', error: error.message });
        await addLog({
            id: `searchBooks-${Date.now()}`,
            message: `Error performing search with query: ${query} - ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};
