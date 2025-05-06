const { BadRequestException, UnauthorizedException } = require('../exceptions/HttpException'); // HttpException'ları içe aktar
const authService = require('../services/authService');
const ResponseHelper = require('../utils/responseHelper');
const { HTTPStatusCode } = require('../utils/HttpStatusCode'); // HTTP durum kodları

// Kullanıcı kaydı
exports.register = async (req, res, next) => {
    try {
        // Kullanıcıyı kaydet ve JWT token oluştur
        const token = await authService.register(req.body);
        // Başarılı kayıt durumunda token ve mesaj döndür
        ResponseHelper.success(res, HTTPStatusCode.Created, { token }, 'Kayıt başarılı');
    } catch (error) {
        // Kayıt hatası durumunda özel hata mesajı gönder
        next(new BadRequestException(error.message || 'Kayıt sırasında bir hata oluştu'));
    }
};

// Kullanıcı girişi
exports.login = async (req, res, next) => {
    try {
        // Giriş yapmaya çalış ve token'ı al
        const token = await authService.login(req.body.username, req.body.password);

        if (!token) {
            // Eğer kullanıcı bulunamazsa, UnauthorizedException yerine özel bir mesaj döndürelim
            throw new UnauthorizedException('Kayıtlı kullanıcı değilsiniz. Lütfen kayıt olun.');
        }

        // Başarılı giriş durumunda token ve mesaj döndür
        ResponseHelper.success(res, HTTPStatusCode.Ok, { token }, 'Giriş başarılı');
    } catch (error) {
        // Hata yönetimi
        console.error("Giriş hatası:", error);  // Hata loglama
        next(error);  // Hata middleware'ine gönder
    }
};
