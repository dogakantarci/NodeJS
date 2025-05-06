"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    // Hata tipi ve detayları kontrol et
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    const errorDetails = process.env.NODE_ENV === 'development' ? err.stack : undefined;

    // Alert gösterimi: Hata türüne göre dinamik olarak uyarı mesajları verebilirsiniz
    if (status === 500) {
        console.error('Server Error:', message);
        // Burada alert'i tetiklemek için farklı bir yöntem kullanılabilir, örn: 
        // - Tarayıcıda alert gösterimi
        // - Konsol logları
        // - Uygulama içinde kullanıcıya gösterilen uyarılar vb.

        // Örneğin, client tarafında bir alert gösterimi yapmak için:
        res.locals.alertMessage = 'Bir hata oluştu, lütfen tekrar deneyin.'; // Bu bilgiyi front-end'e geçirebilirsiniz
    }

    if (status === 400) {
        console.warn('Bad Request:', message);  // Uyarı mesajı
    }

    // Başka hata türleri için farklı log seviyeleri ve mesajlar ekleyebilirsiniz.

    // Hata detaylarını döndür
    res.status(status).json({
        status,
        message,
        error: errorDetails,
    });

    // Eğer bir alert mesajı varsa, front-end'e yönlendirme yapılabilir.
    if (res.locals.alertMessage) {
        // Örneğin front-end kısmında bir alert gösterimi yapılabilir (JS'de alert veya pop-up vb. ile)
        // alert(res.locals.alertMessage); // Tarayıcı tarafında gösterilecek uyarı
    }
};

exports.errorHandler = errorHandler;
