const express = require('express');
const router = express.Router();
const Book = require('./models/Book');


// Ana sayfa rotası
router.get('/', (req, res) => {
    res.send('Anasayfaya hoş geldiniz!');
});


// Kitap Oluşturma
router.post('/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        console.error('Kitap oluşturma hatası:', error);
        res.status(400).json({ error: 'Kitap oluşturma hatası' }); // TODO: Kodlar ve error objesi
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
router.put('/books/:id', async (req, res) => {
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
