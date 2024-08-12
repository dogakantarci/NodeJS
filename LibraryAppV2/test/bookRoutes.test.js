// Gerekli modülleri içe aktarıyoruz
const request = require('supertest');  // API'yi test etmek için supertest modülünü kullanıyoruz
const app = require('../src/app');     // Test edeceğimiz Express uygulamasını içe aktarıyoruz
const mongoose = require('mongoose');  // MongoDB ile çalışmak için mongoose modülünü içe aktarıyoruz

// Test bloğu oluşturuyoruz, 'POST /books' rotasını test ediyoruz
describe('POST /books', () => {
  // Test senaryosu: yeni bir kitap oluşturulması
  it('should create a new book', async () => {
    // Doğru bir JWT token'ı değişkene atıyoruz
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YmEzNmIxY2EyNzhlOWI5NjBiOWZlZiIsImlhdCI6MTcyMzQ3OTcyOSwiZXhwIjoxNzIzNDgzMzI5fQ.yscOyIrrd1NNTk4y2bPJjD-fdTUYQViLMoMAe_PeqDE';  
   
    // supertest kullanarak /books rotasına POST isteği gönderiyoruz
    const res = await request(app)
      .post('/books')  // Kitap oluşturma rotası
      .set('Authorization', `Bearer ${token}`)  // İstek başlığına Authorization token'ını ekliyoruz
      .send({
        title: 'New Book',        // Gönderilen kitap verileri: başlık
        author: 'Author Name'     // Gönderilen kitap verileri: yazar
      });

    // Test sonuçlarını kontrol ediyoruz
    expect(res.status).to.equal(201);            // Yanıt durum kodunun 201 (Created) olduğunu kontrol ediyoruz
    expect(res.body).to.have.property('title').eq('New Book');  // Yanıtın gövdesinde "title" property'sinin "New Book" olduğundan emin oluyoruz
  });
});
