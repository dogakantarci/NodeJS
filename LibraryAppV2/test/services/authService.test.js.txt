const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const authService = require('../../src/services/authService'); // authService'in yolu

describe('Auth Service', () => {
    let userStub;
    let jwtSignStub;

    beforeEach(() => {
        userStub = sinon.stub(User.prototype, 'save');
        jwtSignStub = sinon.stub(jwt, 'sign');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('register', () => {
        it('should register a user and return a token', async () => {
            const mockUserData = { username: 'testUser', password: 'testPass' };
            const mockToken = 'mockToken';
            jwtSignStub.returns(mockToken); // jwt.sign()'in döneceği değeri ayarlıyoruz.

            userStub.resolves(); // user.save() metodu başarılı bir şekilde dönecek.

            const token = await authService.register(mockUserData);

            expect(userStub.calledOnce).toBe(true); // user.save()'in çağrıldığını kontrol et
            expect(jwtSignStub.calledOnce).toBe(true); // jwt.sign()'in çağrıldığını kontrol et
            expect(token).toBe(mockToken); // Dönen token'ı kontrol et
        });

        it('should throw an error if user already exists', async () => {
            const mockUserData = { username: 'testUser', password: 'testPass' };
            userStub.rejects(new Error('User already exists')); // Kayıt sırasında hata fırlat

            await expect(authService.register(mockUserData)).rejects.toThrow('User already exists'); // Hatanın doğru fırlatıldığını kontrol et
        });
    });

    describe('login', () => {
        let findOneStub;
        let comparePasswordStub;

        beforeEach(() => {
            findOneStub = sinon.stub(User, 'findOne');
            comparePasswordStub = sinon.stub();
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should login a user and return a token', async () => {
            const mockUser = { _id: 'userId', username: 'testUser', comparePassword: comparePasswordStub };
            const mockToken = 'mockToken';
            jwtSignStub.returns(mockToken); // jwt.sign()'in döneceği değeri ayarlıyoruz.

            findOneStub.resolves(mockUser); // User.findOne() metodu başarılı bir şekilde dönecek.
            comparePasswordStub.resolves(true); // Password doğru

            const token = await authService.login('testUser', 'testPass');

            expect(findOneStub.calledOnceWith({ username: 'testUser' })).toBe(true); // Kullanıcı adı ile bir kullanıcıyı bulmayı kontrol et
            expect(comparePasswordStub.calledOnceWith('testPass')).toBe(true); // Password'ü kontrol et
            expect(jwtSignStub.calledOnce).toBe(true); // jwt.sign()'in çağrıldığını kontrol et
            expect(token).toBe(mockToken); // Dönen token'ı kontrol et
        });

        it('should throw an error for invalid credentials', async () => {
            findOneStub.resolves(null); // Kullanıcı bulunamadı

            await expect(authService.login('invalidUser', 'testPass')).rejects.toThrow('Invalid username or password'); // Hatanın doğru fırlatıldığını kontrol et
        });

        it('should throw an error if password is incorrect', async () => {
            const mockUser = { _id: 'userId', username: 'testUser', comparePassword: comparePasswordStub };
            findOneStub.resolves(mockUser); // User.findOne() metodu başarılı bir şekilde dönecek.
            comparePasswordStub.resolves(false); // Password yanlış

            await expect(authService.login('testUser', 'wrongPass')).rejects.toThrow('Invalid username or password'); // Hatanın doğru fırlatıldığını kontrol et
        });
    });
});