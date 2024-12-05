const BookService = require('../services/bookService');
const { addLog } = require('../services/elasticsearchService');
const mongoose = require('mongoose');
const { search } = require('../services/elasticsearchService'); // Doğru bir şekilde içe aktarılmalı
const { InternalServerErrorException, BadRequestException, NotFoundException } = require('../exceptions/HttpException');
const { HTTPStatusCode } = require('../utils/HttpStatusCode');


exports.getAllBooks = async (req, res, next) => {
    try {
        const books = await BookService.getAllBooks();
        res.status(HTTPStatusCode.Ok).json(books);

        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: 'All books fetched successfully',
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException('Kitapları alma hatası', error.message));  // Hata sınıfını kullan
        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: `Error fetching books: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

exports.getBookById = async (req, res, next) => {
    const { id } = req.params;

    // Geçersiz ID kontrolü
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new NotFoundException('Geçersiz ID: Kitap bulunamadı'));  // Geçersiz ID hatası
    }

    try {
        const book = await BookService.getBookById(id);
        if (!book) {
            return next(new NotFoundException('Kitap bulunamadı'));  // Kitap bulunamadı hatası
        }
        res.status(HTTPStatusCode.Ok).json(book);
        
        // Başarılı işlem log'u
        await addLog({
            id: `getBookById-${Date.now()}`,
            message: `Book with ID ${id} fetched successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        
        next(new InternalServerErrorException(`Kitap alma hatası: ${error.message}`));
        
        // Hata log'u
        await addLog({
            id: `getBookById-${Date.now()}`,
            message: `Error fetching book with ID ${id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};


exports.createBook = async (req, res, next) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return next(new BadRequestException('Tüm alanlar gereklidir: title, author, publishedDate')); // Hata sınıfını kullan
    }

    try {
        const book = await BookService.createBook(req.body);
        res.status(HTTPStatusCode.Created).json(book);
        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Book with ID ${book._id} created successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException(`Kitap oluşturma hatası: ${error.message}`)); // Hata sınıfını kullan
        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Error creating book: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

exports.updateBook = async (req, res, next) => {
    const { id } = req.params;

    try {
        const book = await BookService.updateBook(id, req.body);
        if (!book) {
            return next(new NotFoundException('Kitap bulunamadı'));
        }

        res.status(HTTPStatusCode.Ok).json(book);
        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `Book with ID ${book._id} updated successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            next(new BadRequestException(`Geçersiz veri formatı: ${error.message}`)); // Hata sınıfını kullan
        } else {
            next(new InternalServerErrorException(`Sunucu hatası: ${error.message}`)); // Hata sınıfını kullan
        }

        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `Error updating book with ID ${req.params.id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

exports.deleteBook = async (req, res, next) => {
    const { id } = req.params;

    try {
        const book = await BookService.deleteBook(id);
        if (!book) {
            return next(new NotFoundException('Kitap bulunamadı'));
        }

        res.status(HTTPStatusCode.NoContent).json({ message: 'Kitap silindi' });
        await addLog({
            id: `deleteBook-${Date.now()}`,
            message: `Book with ID ${req.params.id} deleted successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException(`Kitap silme hatası: ${error.message}`)); // Hata sınıfını kullan
        await addLog({
            id: `deleteBook-${Date.now()}`,
            message: `Error deleting book with ID ${req.params.id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

// Arama işlemi için
exports.searchBooks = async (req, res, next) => {
    const query = req.query.q; // Arama sorgusunu almak için

    // Arama sorgusunun geçerliliğini kontrol et
    if (!query) {
        return next(new BadRequestException('Arama sorgusu gereklidir')); // Hata sınıfını kullan
    }

    try {
        const results = await search(query);
        res.status(HTTPStatusCode.Ok).json(results);

        await addLog({
            id: `searchBooks-${Date.now()}`,
            message: `Search performed with query: ${query}`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException(`Arama hatası: ${error.message}`)); // Hata sınıfını kullan
        await addLog({
            id: `searchBooks-${Date.now()}`,
            message: `Error performing search with query: ${query} - ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};
