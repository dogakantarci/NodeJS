const request = require('supertest');  
const app = require('../src/app');     

// Test bloğu oluşturuyoruz, 'POST /books' rotasını test ediyoruz
describe('POST /books', () => {
  // Test senaryosu: yeni bir kitap oluşturulması
  it('should create a new book', async () => {
    // Doğru bir JWT token'ı değişkene atıyoruz
    const token = 'token';  
   
    // supertest kullanarak /books rotasına POST isteği gönderiyoruz
    const res = await request(app)
      .post('/books')  // Kitap oluşturma rotası
      // İstek başlığına Authorization token'ını ekliyoruz
      .set('Authorization', `Bearer ${token}`)  
      .send({
        title: 'New Book',
        author: 'Author Name' 
      });

    // Test sonuçlarını kontrol ediyoruz
    // Yanıt durum kodunun 201 (Created) olduğunu kontrol ediyoruz
    expect(res.status).to.equal(201);            
    expect(res.body).to.have.property('title').eq('New Book');
  });
});
