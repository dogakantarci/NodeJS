// src/routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { validateBook } = require('../middleware/validationMiddleware');
// Kitapları alma
router.get('/', bookController.getAllBooks);

// Belirli bir kitabı alma
router.get('/:id', bookController.getBookById);

// Yeni kitap oluşturma
router.post('/', protect, validateBook, bookController.createBook);

// Kitap güncelleme
router.put('/:id', protect, validateBook, bookController.updateBook);

// Kitap silme 
router.delete('/:id', protect, bookController.deleteBook);

// Kitap arama
router.get('/search', bookController.searchBooks);

module.exports = router;
