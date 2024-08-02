const express = require('express');
const router = express.Router();
const Book = require('./models/Book');
const { body, validationResult } = require('express-validator');

// Ana sayfa rotası
router.get('/', (req, res) => {
    res.send('Anasayfaya hoş geldiniz!');
});


// Kitap Oluşturma
router.post('/books', [
    body('title').isString().withMessage('Başlık bir metin olmalıdır').notEmpty().withMessage('Başlık boş olamaz'),
    body('author').isString().withMessage('Yazar bir metin olmalıdır').notEmpty().withMessage('Yazar boş olamaz'),
    body('publishedDate').isISO8601().withMessage('Geçerli bir tarih girin'),
    body('genre').optional().isString().withMessage('Tür geçerli bir metin olmalıdır')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        console.error('Kitap oluşturma hatası:', error);
        res.status(400).json({ error: 'Kitap oluşturma hatası' });
    }
});

// Kitapları Okuma
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        console.error('Kitapları okuma hatası:', error);
        res.status(500).json({ error: 'Kitapları okuma hatası' });
    }
});

// Kitap Detayını Getirme
router.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }
        res.status(200).json(book);
    } catch (error) {
        console.error('Kitap getirme hatası:', error);
        res.status(500).json({ error: 'Kitap getirme hatası' });
    }
});

// Kitap Güncelleme
router.put('/books/:id', [
    body('title').optional().isString().withMessage('Başlık bir metin olmalıdır'),
    body('author').optional().isString().withMessage('Yazar bir metin olmalıdır'),
    body('publishedDate').optional().isISO8601().withMessage('Geçerli bir tarih girin'),
    body('genre').optional().isString().withMessage('Tür geçerli bir metin olmalıdır')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }
        res.status(200).json(book);
    } catch (error) {
        console.error('Kitap güncelleme hatası:', error);
        res.status(400).json({ error: 'Kitap güncelleme hatası' });
    }
});

// Kitap Silme
router.delete('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }
        res.status(200).json({ message: 'Kitap silindi' });
    } catch (error) {
        console.error('Kitap silme hatası:', error);
        res.status(500).json({ error: 'Kitap silme hatası' });
    }
});

module.exports = router;
