const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../../src/middleware/authMiddleware');
const User = require('../../src/models/User');
require('dotenv').config();

describe('Auth Middleware', () => {
    let req, res, next, mockUser, token;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        next = sinon.stub();

        // Mock kullanıcı oluştur
        mockUser = { _id: '123', username: 'testuser', password: 'hashedPassword' };

        // JWT token oluştur
        token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
    });

    afterEach(() => {
        sinon.restore(); // Her testten sonra stub'ları geri al
    });

    // Token verilmediğinde 401 hatası döndürme testi
    it('should return 401 if no token is provided', async () => {
        await authenticateUser(req, res, next);

        sinon.assert.calledOnce(res.status); // response status çağrıldı mı
        sinon.assert.calledWith(res.status, 401); // 401 durum kodu ile çağrıldı mı
        sinon.assert.calledOnce(res.json); // response json çağrıldı mı
        sinon.assert.calledWith(res.json, { message: 'Not authorized, no token' }); // Hata mesajı kontrolü
        sinon.assert.notCalled(next); // next() çağrılmadı mı kontrol et
    });

    
    // Geçersiz token ile hata döndürme testi
    it('should return 401 if token is invalid', async () => {
        req.headers.authorization = 'Bearer invalid_token';
        sinon.stub(jwt, 'verify').throws(new jwt.JsonWebTokenError('Invalid token')); // Geçersiz token

        await authenticateUser(req, res, next);

        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 401);
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(res.json, { message: 'Invalid token' });
        sinon.assert.notCalled(next);
    });

    // Süresi dolmuş token ile hata döndürme testi
    it('should return 401 if token has expired', async () => {
        req.headers.authorization = 'Bearer expired_token';
        sinon.stub(jwt, 'verify').throws(new jwt.TokenExpiredError('Token has expired', new Date())); // Süresi dolmuş token

        await authenticateUser(req, res, next);

        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 401);
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(res.json, { message: 'Token has expired' });
        sinon.assert.notCalled(next);
    });

    // JWT secret tanımlı değilse hata döndürme testi
    it('should return 500 if JWT secret is not defined', async () => {
        process.env.JWT_SECRET = ''; // JWT secret'i boş bırak
        req.headers.authorization = `Bearer ${token}`;
        sinon.stub(jwt, 'verify').returns({ id: mockUser._id });
        sinon.stub(User, 'findById').returns(Promise.resolve(mockUser)); 

        await authenticateUser(req, res, next);

        sinon.assert.calledOnce(res.status);
        sinon.assert.calledWith(res.status, 500); // 500 durumu
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(res.json, { message: "JWT secret is not defined." });
        sinon.assert.notCalled(next);
    });
});
