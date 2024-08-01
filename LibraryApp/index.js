const mongoose = require('mongoose');  // Mongoose kütüphanesini içe aktararak MongoDB ile bağlantı kurmayı sağlar
const Book = require('./models/Book');  // Book modelini içe aktararak CRUD işlemleri yapabilirsiniz
require('dotenv').config();

// CRUD işlemlerini gerçekleştiren asenkron bir fonksiyon tanımlıyoruz
async function performCRUDOperations() {
  // CREATE: Yeni bir kitap oluşturuyoruz
  const newBook = new Book({
    title: 'Tutunamayanlar',
    author: 'Oğuz Atay',
    publishedDate: 1972,
  });

  try {
    const savedBook = await newBook.save();  // Kitabı veritabanına kaydediyoruz
    console.log('Kitap oluşturuldu:', savedBook);  // Kaydedilen kitabı konsola yazdırıyoruz

    /* READ: Kitapları veritabanından okuyoruz
    const books = await Book.find();  // Tüm kitapları buluyoruz
    console.log('Tüm kitaplar:', books);  // Kitapları konsola yazdırıyoruz

    // Belirli bir kitabı yazarıyla buluyoruz
    const singleBook = await Book.findOne({ author: 'Oğuz Atay' });
    console.log('Belirli bir kitap:', singleBook);  // Belirli bir kitabı konsola yazdırıyoruz

     //UPDATE: Kitabın yılını güncelliyoruz
    const updatedBook = await Book.findByIdAndUpdate(
      savedBook._id,  // Güncellenecek kitabın ID'si
      { publishedDate: 1975 },   // Güncellenecek veri
      { new: true }  // Güncellenmiş veriyi döndür
    );
    console.log('Kitap güncellendi:', updatedBook);  // Güncellenmiş kitabı konsola yazdırıyoruz
    
    // DELETE: Kitabı veritabanından siliyoruz
    await Book.findByIdAndDelete(savedBook._id);  // Kitabı ID ile siliyoruz
    console.log('Kitap silindi.');  // Silme işlemi tamamlandığında mesajı yazdırıyoruz
    */
    // Son olarak MongoDB bağlantısını kapatıyoruz
    mongoose.connection.close();
  } catch (err) {
    console.error('CRUD işlemleri hatası:', err);  // Hata durumunda mesajı konsola yazdırıyoruz
  }
}
