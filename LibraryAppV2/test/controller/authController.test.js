const { register, login } = require('../../src/controllers/authController');
const authService = require('../../src/services/authService');
const { HTTPStatusCode } = require('../../src/utils/HttpStatusCode');
const { BadRequestException, UnauthorizedException } = require('../../src/exceptions/HttpException');

jest.mock('../../src/services/authService');

describe('AuthController', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                username: 'testUser',
                password: 'testPass',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),  // mock status fonksiyonunu döndür
            json: jest.fn().mockReturnThis(),    // mock json fonksiyonunu döndür
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();  // her testten sonra mockları temizle
    });

    describe('register', () => {
        it('should return success when register is successful', async () => {
            const mockToken = 'mockToken';
            authService.register.mockResolvedValue(mockToken);  // register fonksiyonu başarılı simüle ediliyor

            await register(req, res, next);  // register fonksiyonunu çağır

            // Doğru HTTP durumu ve json yanıtı kontrol et
            expect(res.status).toHaveBeenCalledWith(HTTPStatusCode.Created);  // 201
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Kayıt başarılı',
                data: { token: mockToken },
            });
            expect(next).not.toHaveBeenCalled();  // next fonksiyonunun çağrılmadığını kontrol et
        });

        it('should return error when register fails', async () => {
            const error = new Error('Registration failed');
            authService.register.mockRejectedValue(error);  // register fonksiyonu hata döndürüyor

            await register(req, res, next);  // register fonksiyonunu çağır

            expect(next).toHaveBeenCalledWith(new BadRequestException('Registration failed'));
            expect(res.status).not.toHaveBeenCalled();  // res.status'un çağrılmadığını kontrol et
            expect(res.json).not.toHaveBeenCalled();    // res.json'un çağrılmadığını kontrol et
        });
    });

    describe('login', () => {
        it('should return success when login is successful', async () => {
            const mockToken = 'mockToken';
            authService.login.mockResolvedValue(mockToken);  // login fonksiyonu başarılı simüle ediliyor

            await login(req, res, next);  // login fonksiyonunu çağır

            // Doğru HTTP durumu ve json yanıtı kontrol et
            expect(res.status).toHaveBeenCalledWith(HTTPStatusCode.Ok);  // 200
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Giriş başarılı',
                data: { token: mockToken },
            });
            expect(next).not.toHaveBeenCalled();  // next fonksiyonunun çağrılmadığını kontrol et
        });

        it('should return error when login fails due to invalid credentials', async () => {
            authService.login.mockResolvedValue(null);  // Geçersiz kimlik bilgisi simüle et

            await login(req, res, next);  // login fonksiyonunu çağır

            expect(next).toHaveBeenCalledWith(new UnauthorizedException('Kullanıcı adı veya şifre hatalı'));
            expect(res.status).not.toHaveBeenCalled();  // res.status'un çağrılmadığını kontrol et
            expect(res.json).not.toHaveBeenCalled();    // res.json'un çağrılmadığını kontrol et
        });

        it('should return error when login fails due to an exception', async () => {
            const error = new Error('Login failed');
            authService.login.mockRejectedValue(error);  // login hatası döndür

            await login(req, res, next);  // login fonksiyonunu çağır

            expect(next).toHaveBeenCalledWith(error);  // hata ile next fonksiyonu çağrılıyor
            expect(res.status).not.toHaveBeenCalled();  // res.status'un çağrılmadığını kontrol et
            expect(res.json).not.toHaveBeenCalled();    // res.json'un çağrılmadığını kontrol et
        });
    });
});
