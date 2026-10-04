const Book = require('../models/Book');
const { addLog } = require('../services/elasticsearchService');
//const { search } = require('../services/elasticsearchService');
const { InternalServerErrorException, BadRequestException, NotFoundException } = require('../exceptions/HttpException');
const { HTTPStatusCode } = require('../utils/HttpStatusCode');
const redis = require('../redisClient');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');


// Yardımcı fonksiyon: dinamik cache key oluşturur
const getDefaultCacheKey = (page = 1, limit = 100, sortBy = 'createdAt', sortOrder = 'DESC', filters = {}) => {
    let filterKey = Object.entries(filters)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${value}`)
        .join(':');

    return `allBooks:page=${page}:limit=${limit}:sortBy=${sortBy}:sortOrder=${sortOrder}:${filterKey}`;
};



exports.getAllBooks = async (req, res, next) => {
    try {
        // Sayfalama ve sıralama parametreleri
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 100;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'DESC';

        // Limit sınırı
        const MAX_LIMIT = 100;
        if (limit > MAX_LIMIT) {
            return next(new BadRequestException(`Limit en fazla ${MAX_LIMIT} olabilir.`));
        }

        const offset = (page - 1) * limit;

        // Filtreleme
        const { q, title, author, genre, startDate, endDate } = req.query;
        const where = {};

        if (q) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${q}%` } },
                { author: { [Op.iLike]: `%${q}%` } },
            ];
        }

        if (title) where.title = { [Op.iLike]: `%${title}%` };
        if (author) where.author = { [Op.iLike]: `%${author}%` };
        if (genre) where.genre = { [Op.iLike]: `%${genre}%` };
        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const filters = { q, title, author, genre, startDate, endDate };
        const cacheKey = getDefaultCacheKey(page, limit, sortBy, sortOrder, filters);

        const skipCache = req.query._nocache !== undefined;

        if (!skipCache) {
            const cachedBooks = await redis.get(cacheKey);
            if (cachedBooks) {
                console.log('📦 Cache kullanıldı');
                return res.status(HTTPStatusCode.Ok).json(JSON.parse(cachedBooks));
            }
            console.log('📡 Cache bulunamadı, veritabanından alınıyor...');
        } else {
            console.log('🚫 Cache bypass edildi (_nocache ile)');
        }

        // Veritabanından kitapları çek
        const { count, rows } = await Book.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, sortOrder]],
        });

        const totalPages = Math.ceil(count / limit);

        const responseData = {
            page,
            limit,
            totalPages,
            totalBooks: count,
            books: rows
        };

        // Yeni cache yaz
        await redis.setex(cacheKey, 3600, JSON.stringify(responseData));

        // Yanıtı gönder
        res.status(HTTPStatusCode.Ok).json(responseData);

        // Log
        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: `Books fetched successfully for page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}`,
            level: 'info',
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error(error);
        next(new InternalServerErrorException('Kitapları alma hatası', error.message));

        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: `Error fetching books: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString(),
        });
    }
};

exports.getBookById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const cacheKey = `book:${id}`;

        // Redis cache kontrolü — _nocache parametresi geldiyse bypass et
        const skipCache = req.query._nocache !== undefined;

        if (!skipCache) {
            const cachedBook = await redis.get(cacheKey);
            if (cachedBook) {
                console.log('📦 Cache kullanıldı');
                return res.status(HTTPStatusCode.Ok).json(JSON.parse(cachedBook));
            }

            console.log('🕵️ Cache bulunamadı, veritabanından alınıyor...');
        } else {
            console.log('🚫 Cache bypass edildi, doğrudan veritabanından alınıyor...');
        }
        
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
        return next(new BadRequestException('Tüm alanlar gereklidir: title, author'));
    }

    const transaction = await sequelize.transaction();

    try {
        const book = await Book.create(req.body, { transaction });

        // Cache temizliği
        const keys = await redis.keys('allBooks*');
        if (keys.length > 0) await redis.del(...keys);

        // Transaction commit
        await transaction.commit(); // ✅ işlem başarılıysa veritabanına yaz

        // Yeni verileri çekip yanıtla
        const { count, rows } = await Book.findAndCountAll({
            where: {},
            limit: 100,
            offset: 0,
            order: [['createdAt', 'DESC']],
        });

        const totalPages = Math.ceil(count / 100);
        res.status(HTTPStatusCode.Created).json({
            page: 1,
            limit: 100,
            totalPages,
            totalBooks: count,
            books: rows,
            bypass_cache: true
        });

        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Book with ID ${book.id} created successfully and cache cleared`,
            level: 'info',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        await transaction.rollback(); // ❌ hata varsa geri al
        next(new InternalServerErrorException(`Kitap oluşturma hatası: ${error.message}`));
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
    const transaction = await sequelize.transaction(); // 🔁

    try {
        const [updated] = await Book.update(req.body, { where: { id }, transaction });
        if (!updated) {
            await transaction.rollback();
            return next(new NotFoundException('Kitap bulunamadı'));
        }

        const updatedBook = await Book.findByPk(id, { transaction });

        // Cache güncelleme
        const bookCacheKey = `book:${id}`;
        await redis.del(bookCacheKey);
        await redis.setex(bookCacheKey, 3600, JSON.stringify(updatedBook));

        const defaultCacheKey = getDefaultCacheKey();
        const cachedData = await redis.get(defaultCacheKey);
        if (cachedData) {
            const parsed = JSON.parse(cachedData);
            const idx = parsed.books.findIndex(b => b.id === updatedBook.id);
            if (idx !== -1) parsed.books[idx] = updatedBook;
            await redis.setex(defaultCacheKey, 3600, JSON.stringify(parsed));
        }

        await transaction.commit(); // ✅
        res.status(HTTPStatusCode.Ok).json(updatedBook);

        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `ID'si ${id} olan kitap başarıyla güncellendi ve cache yenilendi.`,
            level: 'info',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        await transaction.rollback(); // ❌
        next(new InternalServerErrorException(`Kitap güncellenirken hata oluştu: ${error.message}`));
        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `ID'si ${id} olan kitap güncellenirken hata oluştu: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString(),
        });
    }
};



exports.deleteBook = async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return next(new BadRequestException('Geçersiz kitap ID\'si'));
    }

    const transaction = await sequelize.transaction(); // 🔁

    try {
        const deleted = await Book.destroy({ where: { id }, transaction });
        if (deleted === 0) {
            await transaction.rollback();
            return next(new NotFoundException('Kitap bulunamadı'));
        }

        // Cache temizliği
        await redis.del(`book:${id}`);
        const keys = await redis.keys('allBooks*');
        if (keys.length > 0) await redis.del(...keys);

        await transaction.commit(); // ✅
        res.status(HTTPStatusCode.Ok).json({ message: 'Kitap silindi' });

        await addLog({
            id: `deleteBook-${Date.now()}`,
            message: `Book with ID ${id} deleted successfully and cache updated`,
            level: 'info',
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        await transaction.rollback(); // ❌
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