const sinon = require('sinon');
const authController = require('../../src/controllers/authController');
const authService = require('../../src/services/authService');

describe('authController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    });

    afterEach(() => {
        // Tüm stub'ları temizle
        sinon.restore();
    });

    describe('register', () => {
        it('should handle existing username', async () => {
            req.body = { username: 'existingUser', password: 'password123' };
            sinon.stub(authService, 'register').rejects(new Error('Kullanıcı adı zaten mevcut'));

            await authController.register(req, res);

            expect(res.status.calledWith(400)).toBe(true);
            expect(res.json.calledWith({ message: 'Kullanıcı adı zaten mevcut' })).toBe(true);
        });

        it('should validate password strength', async () => {
            req.body = { username: 'newUser', password: 'weak' }; // Zayıf şifre
            sinon.stub(authService, 'register').rejects(new Error('Şifre çok zayıf'));

            await authController.register(req, res);

            expect(res.status.calledWith(400)).toBe(true);
            expect(res.json.calledWith({ message: 'Şifre çok zayıf' })).toBe(true);
        });
    });

    describe('login', () => {
        it('should handle incorrect username', async () => {
            req.body = { username: 'wrongUser', password: 'password123' };
            sinon.stub(authService, 'login').rejects(new Error('Kullanıcı adı bulunamadı'));

            await authController.login(req, res);

            expect(res.status.calledWith(400)).toBe(true);
            expect(res.json.calledWith({ message: 'Kullanıcı adı bulunamadı' })).toBe(true);
        });

        it('should handle incorrect password', async () => {
            req.body = { username: 'testUser', password: 'wrongPassword' }; // Yanlış şifre
            sinon.stub(authService, 'login').rejects(new Error('Yanlış şifre'));

            await authController.login(req, res);

            expect(res.status.calledWith(400)).toBe(true);
            expect(res.json.calledWith({ message: 'Yanlış şifre' })).toBe(true);
        });
    });
});
