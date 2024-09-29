const request = require('supertest'); // Supertest modülü, HTTP isteklerini test etmek için kullanılır.
const app = require('../src/app'); // Uygulama modülünü içe aktar.
const Book = require('../src/models/Book'); // Book modelini içe aktar.
const jwt = require('jsonwebtoken'); // JSON Web Token (JWT) oluşturmak için kullanılır.
const mongoose = require('mongoose'); // MongoDB ile etkileşim için Mongoose modülü.
require('dotenv').config(); // Çevre değişkenlerini yükler.

let token; // Token değişkeni, geçerli kullanıcı için oluşturulacak.

// Elasticsearch servisini mockla
jest.mock('../src/services/elasticsearchService', () => ({
    addLog: jest.fn(), // addLog fonksiyonunu taklit et.
    addDocument: jest.fn(), // addDocument fonksiyonunu taklit et.
    searchBooks: jest.fn(), // searchBooks fonksiyonunu taklit et.
}));

const elasticsearchService = require('../src/services/elasticsearchService'); // Mocklanan elasticsearchService'i import et

beforeAll(async () => {
    // Testler başlamadan önce bir JWT token oluştur.
    token = jwt.sign({ id: '66ec79b799ce4b5dc9a1b10e' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Veritabanı bağlantısını aç.
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Test verisini her testten önce temizle.
beforeEach(async () => {
    await Book.deleteMany({}); // Test verisi olarak daha önce eklenmiş kitapları siler.
});

// Kitap Controller Testleri
describe('Book Controller Tests', () => {
    // Tüm kitapları getiren '/books' endpoint'ini test ediyoruz.
    it('should fetch all books', async () => {
        const res = await request(app)
            .get('/books') // GET isteği ile tüm kitapları al.
            .set('Authorization', `Bearer ${token}`); // Token ekleniyor.
        
        // Beklenen sonuç: 200 durum kodu ve bir dizi kitap.
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array); // Yanıtın bir dizi olup olmadığını kontrol et.
    });

    // Geçersiz kitap ID'si için 404 dönen '/books/:id' endpoint'ini test ediyoruz.
    it('should return 404 if book not found', async () => {
        const res = await request(app)
            .get('/books/invalidID') // Geçersiz ID ile GET isteği.
            .set('Authorization', `Bearer ${token}`); // Token ekleniyor.
        
        // Beklenen sonuç: 404 durum kodu ve hata mesajı.
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toBe('Geçersiz ID: Kitap bulunamadı'); // Hata mesajını kontrol et.
    });

    // Yeni bir kitap ekleyen '/books' endpoint'ini test ediyoruz.
    it('should create a new book', async () => {
        const newBook = {
            title: 'Test Book', // Kitabın başlığı.
            author: 'Test Author', // Kitabın yazarı.
            publishedDate: new Date('2023-01-01').toISOString(), // Yayın tarihi, ISO formatında.
        };

        // POST isteği yaparak yeni bir kitap ekliyoruz.
        const res = await request(app)
            .post('/books')
            .set('Authorization', `Bearer ${token}`) // Token ekleniyor.
            .send(newBook); // Gönderilen veri.

        // Beklenen sonuç: 201 "created" durum kodu ve eklenen kitabın verileri.
        expect(res.statusCode).toEqual(201);
        expect(res.body).toMatchObject({
            ...newBook, // Beklenen kitap verileri.
            publishedDate: expect.any(String), // publishedDate bir string olmalı.
        });
    });

    // Mevcut bir kitabı güncelleyen '/books/:id' endpoint'ini test ediyoruz.
    it('should update an existing book', async () => {
        // Test için bir kitap oluşturuyoruz.
        const existingBook = new Book({ title: 'Old Title', author: 'Old Author', publishedDate: new Date('2020-01-01') });
        await existingBook.save(); // Veritabanına kaydediyoruz.

        // Güncellenecek yeni veriler.
        const updatedBook = {
            title: 'Updated Title', // Güncellenmiş kitap başlığı.
            author: 'Updated Author', // Güncellenmiş yazar adı.
            publishedDate: new Date('2024-01-01').toISOString(), // Yayın tarihi, ISO formatında.
        };

        // Elasticsearch'ten dönen verileri mockla
        elasticsearchService.searchBooks.mockResolvedValue([{ _id: existingBook._id, title: 'Old Title' }]);

        // PUT isteği yaparak kitabı güncelliyoruz.
        const res = await request(app)
            .put(`/books/${existingBook._id}`) // Kitap ID'sini kullanarak güncelleme isteği.
            .set('Authorization', `Bearer ${token}`) // Token ekleniyor.
            .send(updatedBook); // Gönderilen güncellenmiş veri.

        // Beklenen sonuç: 200 "başarılı" durum kodu ve güncellenmiş kitap verileri.
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject({
            ...updatedBook, // Beklenen güncellenmiş kitap verileri.
            publishedDate: expect.any(String), // publishedDate bir string olmalı.
        });
    });

    // Kitabı silen '/books/:id' endpoint'ini test ediyoruz.
    it('should delete an existing book', async () => {
        // Test için bir kitap oluşturuyoruz.
        const book = new Book({ title: 'Test Book', author: 'Test Author', publishedDate: new Date('2021-01-01') });
        await book.save(); // Veritabanına kaydediyoruz.

        // DELETE isteği yaparak kitabı siliyoruz.
        const res = await request(app)
            .delete(`/books/${book._id}`) // Kitap ID'sini kullanarak silme isteği.
            .set('Authorization', `Bearer ${token}`); // Token ekleniyor.

        // Beklenen sonuç: 204 "başarılı" durum kodu.
        expect(res.statusCode).toEqual(204);

        // Kitabın artık bulunmadığını kontrol ediyoruz.
        const checkRes = await request(app)
            .get(`/books/${book._id}`) // Silinen kitabı tekrar kontrol et.
            .set('Authorization', `Bearer ${token}`); // Token ekleniyor.
        
        // Beklenen sonuç: 404 durum kodu.
        expect(checkRes.statusCode).toEqual(404);
    });

    afterAll(async () => {
        await mongoose.connection.close(); // Testlerden sonra veritabanı bağlantısını kapat.
    });
});
