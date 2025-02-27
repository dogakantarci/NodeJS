// src/routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { validateBook } = require('../middleware/validationMiddleware');
const limiter = require('../middleware/rateLimiter'); // Middleware'ı dahil et

// Kitapları alma
router.get('/', limiter, bookController.getAllBooks);

//Filtreleme
router.get('/filter', bookController.filterBooks);

// Kitap arama
router.get('/search', bookController.searchBooks);

// Belirli bir kitabı alma
router.get('/:id', bookController.getBookById);

// Yeni kitap oluşturma
router.post('/', authenticateUser, validateBook, bookController.createBook);

// Kitap güncelleme
router.put('/:id', authenticateUser, validateBook, bookController.updateBook);

// Kitap silme 
router.delete('/:id', authenticateUser, bookController.deleteBook);



module.exports = router;
