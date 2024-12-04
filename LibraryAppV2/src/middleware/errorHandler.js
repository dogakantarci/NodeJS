"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    // Hata durumu varsa, bunu al, yoksa 500 (Internal Server Error) kullan
    const status = err.status || 500;
    // Eğer hata mesajı varsa, bunu al, yoksa varsayılan bir mesaj kullan
    const message = err.message || "Internal Server Error";
    // Hata detaylarını döndürmek (geliştirme aşamasında kullanışlı olabilir)
    const errorDetails = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    // JSON formatında hata mesajı gönder
    res.status(status).json({
        status,
        message,
        error: errorDetails, // Sadece geliştirme ortamında detaylı hata mesajı
    });
};
exports.errorHandler = errorHandler;
