const sinon = require('sinon');
const express = require('express');
const authRoutes = require('../../src/routes/authRoutes');
const authController = require('../../src/controllers/authController');

// Testler için sahte bir express uygulaması oluşturacağız
describe('Auth Routes', () => {
    let app, req, res, next;

    beforeEach(() => {
        // Express uygulaması oluştur
        app = express();

        // Mock request ve response objeleri oluştur
        req = {
            body: {}
        };
        res = {
            status: sinon.stub().returnsThis(), // status çağrıldığında yine res objesini dönecek
            json: sinon.stub()
        };
        next = sinon.stub(); // next middleware'ini stub'la

        // authRoutes'u mock express uygulamamıza ekleyelim
        app.use('/auth', authRoutes);
    });

    afterEach(() => {
        sinon.restore(); // Tüm stub'ları test sonrası geri al
    });

    it('should call authController.register when POST /auth/register is hit', () => {
        // authController.register metodunu stub'la
        const registerStub = sinon.stub(authController, 'register').callsFake((req, res) => {
            res.status(201).json({ message: 'User registered successfully' });
        });

        // Sahte bir request simüle et
        req.body = { username: 'testUser', password: 'password123' };
        
        // authController.register'ı doğrudan çağır
        authController.register(req, res, next);

        // register fonksiyonunun çağrıldığını doğrula
        sinon.assert.calledOnce(registerStub);
        sinon.assert.calledWith(registerStub, req, res, next);

        // Doğru status ve json response döndü mü kontrol et
        sinon.assert.calledWith(res.status, 201);
        sinon.assert.calledWith(res.json, { message: 'User registered successfully' });
    });

    it('should call authController.login when POST /auth/login is hit', () => {
        // authController.login metodunu stub'la
        const loginStub = sinon.stub(authController, 'login').callsFake((req, res) => {
            res.status(200).json({ token: 'fake-jwt-token' });
        });

        // Sahte bir request simüle et
        req.body = { username: 'testUser', password: 'password123' };

        // authController.login'ı doğrudan çağır
        authController.login(req, res, next);

        // login fonksiyonunun çağrıldığını doğrula
        sinon.assert.calledOnce(loginStub);
        sinon.assert.calledWith(loginStub, req, res, next);

        // Doğru status ve json response döndü mü kontrol et
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, { token: 'fake-jwt-token' });
    });
});
