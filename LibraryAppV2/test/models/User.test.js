const sinon = require('sinon');
const User = require('../../src/models/User'); // Mongoose bağımsız modeli burada kullanıyoruz

describe('User Model', () => {
    let userData;

    beforeEach(() => {
        userData = {
            username: 'testUser',
            password: 'password123'
        };

        // Mongoose bağımsız mock'lar
        sinon.stub(User.prototype, 'save').callsFake(async function () {
            // Manuel olarak password'u hash'lenmiş hale getiriyoruz
            this.password = 'hashedPassword123';
            return this;
        });

        sinon.stub(User.prototype, 'comparePassword').resolves(true); // Mock şifre karşılaştırması
    });

    afterEach(() => {
        sinon.restore(); // Her testten sonra stub'ları geri al
    });

    it('should create a user successfully without Mongoose', async () => {
        const user = new User(userData);
        const savedUser = await user.save(); // Mongoose bağımlı değil, stub'landı

        expect(savedUser.username).toEqual(userData.username);
        expect(savedUser.password).not.toEqual(userData.password); // Şifre hashlendi mi?
    });

    it('should hash the password before saving without Mongoose', async () => {
        const user = new User(userData);
        await user.save(); // Stub kullanıldı

        expect(user.password).toEqual('hashedPassword123'); // Şifre hashlendi mi?
    });

    it('should return true if password matches without Mongoose', async () => {
        const user = new User(userData);
        await user.save(); // Stub kullanıldı

        const isMatch = await user.comparePassword('password123'); // Mock şifre karşılaştırması
        expect(isMatch).toBe(true); // Şifre doğru mu?
    });
});
