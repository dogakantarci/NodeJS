const { sequelize } = require('../config/db'); // Sequelize instance'ını doğru içe aktarın
const Book = require('../models/Book')(sequelize); // sequelize instance'ı ile çağırılmalı
const { addLog } = require('../services/elasticsearchService');
//const { search } = require('../services/elasticsearchService');
const { InternalServerErrorException, BadRequestException, NotFoundException } = require('../exceptions/HttpException');
const { HTTPStatusCode } = require('../utils/HttpStatusCode');
const redis = require('../redisClient');
const { Op } = require('sequelize');

exports.getAllBooks = async (req, res, next) => {
    try {
        // Sayfalama parametrelerini al
        const page = parseInt(req.query.page) || 1;  // Varsayılan sayfa 1 olacak
        const limit = parseInt(req.query.limit) || 100; // Varsayılan limit 20 olacak
        const offset = (page - 1) * limit; // Sayfa başına kaç veri alacağımızı hesapla

        
        // Sıralama parametrelerini al
        const sortBy = req.query.sortBy || 'createdAt'; // Varsayılan sıralama alanı
        const sortOrder = req.query.sortOrder || 'ASC'; // Varsayılan sıralama türü (ASC)

        console.debug(`Sorting parameters: sortBy=${sortBy}, sortOrder=${sortOrder}`);

        // Cache anahtarını oluştur
        const cacheKey = `allBooks:page=${page}:limit=${limit}:sortBy=${sortBy}:sortOrder=${sortOrder}`;

        // Redis cache kontrolü
        const cachedBooks = await redis.get(cacheKey);
        if (cachedBooks) {
            console.debug(`Cache hit for ${cacheKey}`);
            console.log('Cache kullanıldı');
            return res.status(HTTPStatusCode.Ok).json(JSON.parse(cachedBooks));
        }

        console.log('Cache bulunamadı, veritabanından alınıyor...');

        // Sequelize ile kitapları al
        const books = await Book.findAll({
            limit: limit,      // Limiti ayarla
            offset: offset,    // Sayfalama için offset
            order: [[sortBy, sortOrder.toUpperCase()]] // Sıralama
        });
        console.debug(`Fetched ${books.length} books from database.`);

        res.status(HTTPStatusCode.Ok).json(books);

        // Cache'e ekle
        redis.setex(cacheKey, 3600, JSON.stringify(books));
        console.debug(`Books cached successfully for ${cacheKey}.`);

        // Başarılı işlem log'u
        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: `Books fetched successfully for page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        console.debug(`Error occurred in getAllBooks: ${error.stack}`);
        next(new InternalServerErrorException('Kitapları alma hatası', error.message));

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

    try {
        const cacheKey = `book:${id}`;

        // Redis cache kontrolü
        const cachedBook = await redis.get(cacheKey);
        if (cachedBook) {
            console.log('Cache kullanıldı');
            return res.status(HTTPStatusCode.Ok).json(JSON.parse(cachedBook)); 
        }

        console.log('Cache bulunamadı, veritabanından alınıyor...');
        
        // Sequelize ile kitap verisini al
        const book = await Book.findByPk(id); // Sequelize methodu
        if (!book) {
            return next(new NotFoundException('Kitap bulunamadı'));
        }
        res.status(HTTPStatusCode.Ok).json(book);

        // Cache'e ekle
        redis.setex(cacheKey, 3600, JSON.stringify(book));

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
        return next(new BadRequestException('Tüm alanlar gereklidir: title, author, publishedDate'));
    }

    try {
        // Sequelize ile yeni kitap oluştur
        const book = await Book.create(req.body);
        res.status(HTTPStatusCode.Created).json(book);

        // Cache temizleme
        const allBooksCacheKey = 'allBooks';
        await redis.del(allBooksCacheKey); // Tüm kitaplar cache’ini temizle

        console.log(`Cache temizlendi: ${allBooksCacheKey}`);

        // Başarılı işlem log’u
        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Book with ID ${book.id} created successfully and cache cleared`,
            level: 'info',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException(`Kitap oluşturma hatası: ${error.message}`));

        // Hata log’u
        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Error creating book: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString(),
        });
    }
};


exports.updateBook = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Sequelize ile kitap güncelle
        const [updated] = await Book.update(req.body, { where: { id } });
        if (!updated) {
            return next(new NotFoundException('Kitap bulunamadı'));
        }

        const updatedBook = await Book.findByPk(id);
        res.status(HTTPStatusCode.Ok).json(updatedBook);

        // Cache’i temizle ve güncelle
        const bookCacheKey = `book:${id}`;
        await redis.del(bookCacheKey); // Güncellenen kitap için cache’i sil

        const allBooksCacheKey = 'allBooks';
        await redis.del(allBooksCacheKey); // Tüm kitaplar cache’ini de sil

        console.log(`Cache temizlendi: ${bookCacheKey}, ${allBooksCacheKey}`);

        // Güncellenmiş veriyi cache’e ekle
        redis.setex(bookCacheKey, 3600, JSON.stringify(updatedBook));

        // Başarılı işlem log’u
        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `Book with ID ${id} updated successfully`,
            level: 'info',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException(`Kitap güncelleme hatası: ${error.message}`));
    }
};

exports.deleteBook = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Sequelize ile kitap sil
        const deleted = await Book.destroy({ where: { id } });
        if (!deleted) {
            return next(new NotFoundException('Kitap bulunamadı'));
        }

        // Cache’i temizle
        const bookCacheKey = `book:${id}`;
        await redis.del(bookCacheKey); // Silinen kitap için cache’i sil

        const allBooksCacheKey = 'allBooks';
        await redis.del(allBooksCacheKey); // Tüm kitaplar cache’ini de temizle

        res.status(HTTPStatusCode.NoContent).json({ message: 'Kitap silindi' });

        // Başarılı işlem log’u
        await addLog({
            id: `deleteBook-${Date.now()}`,
            message: `Book with ID ${id} deleted successfully`,
            level: 'info',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException(`Kitap silme hatası: ${error.message}`));
    }
};

exports.searchBooks = async (req, res) => {
    try {
        const { query } = req.query;

        const searchCriteria = {};

        if (query) {
            searchCriteria[Op.or] = [
                { title: { [Op.iLike]: `%${query}%` } }, // Küçük/büyük harf duyarsız arama
                { author: { [Op.iLike]: `%${query}%` } }
            ];
        }

        const books = await Book.findAll({ where: searchCriteria });
        if (!books.length) {
            return res.status(404).json({ message: 'Kitap bulunamadı.' });
        }

        res.status(200).json(books);
    } catch (error) {
        console.error('Arama sırasında hata oluştu:', error);
        res.status(500).json({ error: 'Arama sırasında bir hata oluştu.' });
    }
};

exports.filterBooks = async (req, res) => {
    try {
        const { title, startDate, endDate } = req.query;

        // Filtreleme için kullanılacak kriterler
        const filterCriteria = {};

        // Title parametresi varsa, sadece title'da filtreleme yap
        if (title) {
            filterCriteria.title = { [Op.iLike]: `%${title}%` }; // Küçük/büyük harf duyarsız arama
        }

        // Filtreleme için tarih aralığı
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Tarihlerin geçerli olup olmadığını kontrol et
            if (!isNaN(start) && !isNaN(end)) {
                filterCriteria.createdAt = {
                    [Op.gte]: start, // Başlangıç tarihi
                    [Op.lte]: end    // Bitiş tarihi
                };
            } else {
                return res.status(400).json({ message: 'Geçersiz tarih formatı.' });
            }
        }

        console.log('Filter criteria:', filterCriteria);

        // Sequelize ile filtreleme yap
        const books = await Book.findAll({
            where: filterCriteria
        });

        // Eğer kitaplar bulunmazsa
        if (!books || books.length === 0) {
            return res.status(404).json({ message: 'Kitap bulunamadı.' });
        }

        // Bulunan kitapları döndür
        res.status(200).json(books);
    } catch (error) {
        console.error('Filtreleme sırasında hata oluştu:', error);
        res.status(500).json({ error: 'Filtreleme sırasında bir hata oluştu.' });
    }
};
