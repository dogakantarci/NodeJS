// src/middleware/validationMiddleware.js

const { body, validationResult } = require('express-validator');

// Kitap doğrulama middleware'i
exports.validateBook = [
  body('title')
    .isString().withMessage('Başlık bir metin olmalıdır.')
    .notEmpty().withMessage('Başlık boş olamaz.'),

  body('author')
    .isString().withMessage('Yazar adı bir metin olmalıdır.')
    .notEmpty().withMessage('Yazar adı boş olamaz.'),

  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Yıl geçerli bir yıl olmalıdır.')
    .optional(), // Bu alan isteğe bağlıdır, fakat varsa geçerli olmalıdır

  // Hataları kontrol et
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
