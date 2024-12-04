// src/controllers/authController.js
const { BadRequestException, UnauthorizedException } = require('../exceptions/HttpException'); // HttpException'ları içe aktar
const authService = require('../services/authService');
const ResponseHelper = require('../utils/responseHelper');
const { HTTPStatusCode } = require('../utils/HttpStatusCode'); // HTTP durum kodları


exports.register = async (req, res, next) => {
    try {
        const token = await authService.register(req.body);
        ResponseHelper.success(res, HTTPStatusCode.Created, { token }, 'Kayıt başarılı');
    } catch (error) {
        next(new BadRequestException(error.message));
    }
};

exports.login = async (req, res, next) => {
    try {
        const token = await authService.login(req.body.username, req.body.password);
        
        if (!token) {
            throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı');
        }

        ResponseHelper.success(res, HTTPStatusCode.Ok, { token }, 'Giriş başarılı');
    } catch (error) {
        next(error);
    }
};

