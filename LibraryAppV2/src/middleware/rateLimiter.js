// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Rate limiting middleware: Her IP için 1 dakikada sadece 100 istek
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 30, // 30 istek
  message: 'Çok fazla istek gönderildi, lütfen bir süre sonra tekrar deneyin.',
  headers: true, // Yanıtlarda limit bilgisini göster
});

module.exports = limiter;
