const { BadRequestException, UnauthorizedException } = require('../exceptions/HttpException'); // HttpException'ları içe aktar
const authService = require('../services/authService');
const ResponseHelper = require('../utils/responseHelper');
const { HTTPStatusCode } = require('../utils/HttpStatusCode'); // HTTP durum kodları

exports.register = async (req, res, next) => {
    try {
        // Kullanıcıyı kaydet ve JWT token oluştur
        const token = await authService.register(req.body);
        ResponseHelper.success(res, HTTPStatusCode.Created, { token }, 'Kayıt başarılı');
    } catch (error) {
        // Kayıt hatası durumunda özel hata mesajı gönder
        next(new BadRequestException(error.message || 'Kayıt sırasında bir hata oluştu'));
    }
};

exports.login = async (req, res, next) => {
    try {
        // Giriş yapmaya çalış ve token'ı al
        const token = await authService.login(req.body.username, req.body.password);
        
        if (!token) {
            throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı');
        }

        // Başarılı giriş
        ResponseHelper.success(res, HTTPStatusCode.Ok, { token }, 'Giriş başarılı');
    } catch (error) {
        // Giriş hatası durumunda hatayı yönet
        next(error);
    }
};
