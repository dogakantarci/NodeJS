const authService = require('../src/services/authService');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

// Mock JWT işlevselliği
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

jest.mock('../src/models/User');

describe('Auth Service Tests', () => {
    const userData = {
        username: 'testuser',
        password: 'testpassword',
    };

    beforeEach(() => {
        jest.clearAllMocks(); // Her testten önce mockları temizle
    });

    // Kullanıcı kaydetme işlemini test et
    describe('register', () => {
        it('should create a new user and return a token', async () => {
            // Mock User.save() işlevi
            User.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(true),
                _id: 'mockUserId',
            }));

            // Mock token oluşturma
            jwt.sign.mockReturnValue('mockToken');

            const token = await authService.register(userData);

            expect(User).toHaveBeenCalledWith(userData); // User modelinin doğru argümanlarla çağrıldığını kontrol et
            expect(jwt.sign).toHaveBeenCalledWith({ id: 'mockUserId' }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token oluşturma kontrolü
            expect(token).toEqual('mockToken'); // Dönüş değerini kontrol et
        });
    });

    // Kullanıcı girişi işlemini test et
    describe('login', () => {
        it('should return a token for valid credentials', async () => {
            // Mock User.findOne() işlevi
            User.findOne.mockResolvedValue({
                _id: 'mockUserId',
                comparePassword: jest.fn().mockResolvedValue(true), // Parola karşılaştırma başarılı
            });

            // Mock token oluşturma
            jwt.sign.mockReturnValue('mockToken');

            const token = await authService.login(userData.username, userData.password);

            expect(User.findOne).toHaveBeenCalledWith({ username: userData.username }); // Kullanıcı bulma kontrolü
            expect(jwt.sign).toHaveBeenCalledWith({ id: 'mockUserId' }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token oluşturma kontrolü
            expect(token).toEqual('mockToken'); // Dönüş değerini kontrol et
        });

        it('should throw an error for invalid credentials', async () => {
            User.findOne.mockResolvedValue(null); // Kullanıcı bulunamadı

            await expect(authService.login(userData.username, userData.password)).rejects.toThrow('Invalid username or password'); // Hata kontrolü
        });
    });
});
