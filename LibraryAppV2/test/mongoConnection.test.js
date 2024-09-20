const mongoose = require('mongoose');
require('dotenv').config(); // .env dosyasını oku

describe('MongoDB Connection Tests', () => {
    beforeAll(async () => {
        // Bağlantı kurmayı dene
        await mongoose.connect(process.env.MONGODB_URI, {
        });
    });

    afterAll(async () => {
        // Bağlantıyı kapat
        await mongoose.connection.close();
    });

    it('should connect to MongoDB successfully', async () => {
        const connectionState = mongoose.connection.readyState;
        expect(connectionState).toBe(1); // 1 = connected
    });
});
