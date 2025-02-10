const { sequelize } = require('../config/db'); // Sequelize instance'ını doğru içe aktarın
const Book = require('../models/Book')(sequelize); // sequelize instance'ı ile çağırılmalı
const { addLog } = require('../services/elasticsearchService');
//const { search } = require('../services/elasticsearchService');
const { InternalServerErrorException, BadRequestException, NotFoundException } = require('../exceptions/HttpException');
const { HTTPStatusCode } = require('../utils/HttpStatusCode');
const redis = require('../redisClient');
const { Op } = require('sequelize');

/* exports.getAllBooks = async (req, res, next) => {
    try {
        // Sayfalama parametrelerini al
        const page = parseInt(req.query.page) || 1;  // Varsayılan sayfa 1 olacak
        let limit = parseInt(req.query.limit) || 100; // Varsayılan limit 100 olacak

        // Limitin aşırı büyük olmasını engelle
        const MAX_LIMIT = 100; // Maksimum alınabilecek veri sayısı
        if (limit > MAX_LIMIT) {
            return next(new BadRequestException(`Limit en fazla ${MAX_LIMIT} olabilir.`));
        }

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

        // Yeni kitap ekleme işleminden sonra cache güncellemesi yap
        // Cache'e kitapları ekle
        await redis.setex(cacheKey, 3600, JSON.stringify(books));
        console.debug(`Books cached successfully for ${cacheKey}.`);

        res.status(HTTPStatusCode.Ok).json(books);

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

*/


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

// Önce yardımcı bir fonksiyon oluşturalım
const getDefaultCacheKey = (page = 1, limit = 100, sortBy = 'createdAt', sortOrder = 'DESC') => {
    return `allBooks:page=${page}:limit=${limit}:sortBy=${sortBy}:sortOrder=${sortOrder}`;
};

exports.createBook = async (req, res, next) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return next(new BadRequestException('Tüm alanlar gereklidir: title, author, publishedDate'));
    }

    try {
        const book = await Book.create(req.body);

        // Önce tekil kitap cache'ini güncelle
        const bookCacheKey = `book:${book.id}`;
        await redis.setex(bookCacheKey, 3600, JSON.stringify(book));

        // Ana liste cache'lerini güncelle
        const defaultCacheKey = getDefaultCacheKey();
        const cachedData = await redis.get(defaultCacheKey);
        
        if (cachedData) {
            const books = JSON.parse(cachedData);
            books.unshift(book);
            
            if (books.length > 100) {
                books.pop();
            }
            
            await redis.setex(defaultCacheKey, 3600, JSON.stringify(books));
            console.log(`Default cache güncellendi, yeni kitap eklendi: ${book.id}`);
        } else {
            // Cache yoksa, veritabanından tüm kitapları çek
            const allBooks = await Book.findAll({
                limit: 100,
                order: [['createdAt', 'DESC']]
            });
            await redis.setex(defaultCacheKey, 3600, JSON.stringify(allBooks));
            console.log(`Yeni cache oluşturuldu, tüm kitaplar eklendi`);
        }

        res.status(HTTPStatusCode.Created).json(book);

        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Book with ID ${book.id} created successfully and cache updated`,
            level: 'info',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException(`Kitap oluşturma hatası: ${error.message}`));

        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Error creating book: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString(),
        });
    }
};

exports.getAllBooks = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'DESC';

        const cacheKey = getDefaultCacheKey(page, limit, sortBy, sortOrder);

        const cachedBooks = await redis.get(cacheKey);
        if (cachedBooks) {
            console.log('Cache kullanıldı');
            return res.status(HTTPStatusCode.Ok).json(JSON.parse(cachedBooks));
        }

        console.log('Cache bulunamadı, veritabanından alınıyor...');

        const books = await Book.findAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [[sortBy, sortOrder]]
        });

        await redis.setex(cacheKey, 3600, JSON.stringify(books));

        res.status(HTTPStatusCode.Ok).json(books);

        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: `Books fetched successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException('Kitapları alma hatası', error.message));
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

        // Kitap cache'ini kontrol et ve güncelle
        const bookCacheKey = `book:${id}`;
        const cachedBook = await redis.get(bookCacheKey);

        if (cachedBook) {
            // Eğer kitap cache'de mevcutsa, üzerine yaz
            await redis.setex(bookCacheKey, 3600, JSON.stringify(updatedBook)); // 1 saat boyunca geçerli
            console.log(`Cache güncellendi: ${bookCacheKey}`);
        } else {
            // Eğer kitap cache'de yoksa, yeni cache ekle
            await redis.setex(bookCacheKey, 3600, JSON.stringify(updatedBook)); // 1 saat boyunca geçerli
            console.log(`Yeni kitap cache'e eklendi: ${bookCacheKey}`);
        }

        // Başarılı işlem log’u
        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `Book with ID ${id} updated successfully and cache updated`,
            level: 'info',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException(`Kitap güncelleme hatası: ${error.message}`));

        // Hata log’u
        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `Error updating book with ID ${id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString(),
        });
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
        const { title, author, startDate, endDate } = req.query;

        // Filtreleme için kullanılacak kriterler
        const filterCriteria = {};

        // Title parametresi varsa, küçük/büyük harf duyarsız arama yap
        if (title) {
            filterCriteria.title = { [Op.iLike]: `%${title}%` };
        }

        // Author parametresi varsa, küçük/büyük harf duyarsız arama yap
        if (author) {
            filterCriteria.author = { [Op.iLike]: `%${author}%` };
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