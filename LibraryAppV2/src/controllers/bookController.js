const BookService = require('../services/bookService');
const { addLog } = require('../services/elasticsearchService');
const mongoose = require('mongoose');
//const { search } = require('../services/elasticsearchService');
const { InternalServerErrorException, BadRequestException, NotFoundException } = require('../exceptions/HttpException');
const { HTTPStatusCode } = require('../utils/HttpStatusCode');
const redis = require('../redisClient');
const Book = require('../models/Book'); // Kitap modelini içe aktar


exports.getAllBooks = async (req, res, next) => {
    try {
        const cacheKey = 'allBooks'; // Genel kitaplar için cache anahtarı

        // Redis cache kontrolü
        const cachedBooks = await redis.get(cacheKey);
        if (cachedBooks) {
            console.log('Cache kullanıldı');
            return res.status(HTTPStatusCode.Ok).json(JSON.parse(cachedBooks)); // Cache'ten kitaplar döndür
        }

        console.log('Cache bulunamadı, veritabanından alınıyor...');
        // Cache'te veri yoksa, veritabanından kitapları al
        const books = await BookService.getAllBooks();
        res.status(HTTPStatusCode.Ok).json(books);

        // Cache'e ekle
        redis.setex(cacheKey, 3600, JSON.stringify(books)); // 1 saat boyunca cache'le

        // Başarılı işlem log'u
        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: 'All books fetched successfully',
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException('Kitapları alma hatası', error.message));  // Hata sınıfını kullan

        // Hata log'u
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
        const cacheKey = `book:${id}`; // Kitap ID'sine özel cache anahtarı

        // Redis cache kontrolü
        const cachedBook = await redis.get(cacheKey);
        if (cachedBook) {
            console.log('Cache kullanıldı');
            return res.status(HTTPStatusCode.Ok).json(JSON.parse(cachedBook)); // Cache'ten kitap verisini döndür
        }
        console.log('Cache bulunamadı, veritabanından alınıyor...');
        const book = await BookService.getBookById(id);
        if (!book) {
            return next(new NotFoundException('Kitap bulunamadı'));  // Kitap bulunamadı hatası
        }
        res.status(HTTPStatusCode.Ok).json(book);
        
        // Cache'e ekle
        redis.setex(cacheKey, 3600, JSON.stringify(book)); // 1 saat boyunca cache'le

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

        // Başarılı işlem log'u
        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Book with ID ${book._id} created successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException(`Kitap oluşturma hatası: ${error.message}`)); // Hata sınıfını kullan

        // Hata log'u
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

        // Başarılı işlem log'u
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

        // Hata log'u
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

        // Başarılı işlem log'u
        await addLog({
            id: `deleteBook-${Date.now()}`,
            message: `Book with ID ${req.params.id} deleted successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException(`Kitap silme hatası: ${error.message}`)); // Hata sınıfını kullan

        // Hata log'u
        await addLog({
            id: `deleteBook-${Date.now()}`,
            message: `Error deleting book with ID ${req.params.id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

exports.searchBooks = async (req, res) => {
    try {
        // Query parametrelerini al
        const { query, author, startDate, endDate } = req.query;

        // Arama kriterlerini oluştur
        const searchCriteria = {};

        // query parametresi varsa, title ve author'da arama yap
        if (query) {
            searchCriteria.$or = [
                { title: { $regex: new RegExp(query, 'i') } },  // Küçük/büyük harf duyarsız arama
                { author: { $regex: new RegExp(query, 'i') } }  // Küçük/büyük harf duyarsız arama
            ];
        }

        // Author parametresi varsa, sadece author'da filtreleme yap
        if (author) {
            searchCriteria.author = { $regex: new RegExp(author, 'i') };
        }

        // Filtreleme için tarih aralığı
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Tarihlerin geçerli olup olmadığını kontrol et
            if (!isNaN(start) && !isNaN(end)) {
                searchCriteria.createdAt = {
                    $gte: start, // Başlangıç tarihi
                    $lte: end    // Bitiş tarihi
                };
            } else {
                return res.status(400).json({ message: 'Geçersiz tarih formatı.' });
            }
        }

        // MongoDB'de arama ve filtreleme yap
        const books = await Book.find(searchCriteria);

        // Eğer kitaplar bulunmazsa
        if (!books || books.length === 0) {
            return res.status(404).json({ message: 'Kitap bulunamadı.' });
        }

        // Bulunan kitapları döndür
        res.status(200).json(books);
    } catch (error) {
        console.error('Arama sırasında hata oluştu:', error);
        res.status(500).json({ error: 'Arama sırasında bir hata oluştu.' });
    }
};
