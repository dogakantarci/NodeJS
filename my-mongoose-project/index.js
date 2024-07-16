const mongoose = require('mongoose');  // Mongoose kütüphanesini içe aktararak MongoDB ile bağlantı kurmayı sağlar
const User = require('./models/User');  // User modelini içe aktararak CRUD işlemleri yapabilirsiniz

// MongoDB'ye bağlanmak için mongoose.connect() metodunu kullanıyoruz
mongoose.connect('mongodb+srv://dogakantarci:MongoDB1.@cluster.sdjbxqz.mongodb.net/', {
  useNewUrlParser: true,  // Yeni URL parselerini kullanarak daha güvenilir bağlantı sağlar
  useUnifiedTopology: true,  // Topology engine'in en güncel versiyonunu kullanır
})
  .then(() => {
    console.log('MongoDB bağlantısı başarılı!');  // Bağlantı başarılıysa konsola mesaj yazdırır
    performCRUDOperations();  // CRUD işlemlerini başlatır
  })
  .catch(err => {
    console.error('MongoDB bağlantısı hatası:', err);  // Bağlantı hatası durumunda hata mesajını konsola yazdırır
  });

// CRUD işlemlerini gerçekleştiren asenkron bir fonksiyon tanımlıyoruz
async function performCRUDOperations() {
  // CREATE: Yeni bir kullanıcı oluşturuyoruz
  const newUser = new User({
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30,
  });

  try {
    const savedUser = await newUser.save();  // Kullanıcıyı veritabanına kaydediyoruz
    console.log('Kullanıcı oluşturuldu:', savedUser);  // Kaydedilen kullanıcıyı konsola yazdırıyoruz

    // READ: Kullanıcıları veritabanından okuyoruz
    const users = await User.find();  // Tüm kullanıcıları buluyoruz
    console.log('Tüm kullanıcılar:', users);  // Kullanıcıları konsola yazdırıyoruz

    // Belirli bir kullanıcıyı e-posta adresiyle buluyoruz
    const singleUser = await User.findOne({ email: 'john.doe@example.com' });
    console.log('Belirli bir kullanıcı:', singleUser);  // Belirli bir kullanıcıyı konsola yazdırıyoruz

    /* UPDATE: Kullanıcının yaşını güncelliyoruz
    const updatedUser = await User.findByIdAndUpdate(
      savedUser._id,  // Güncellenecek kullanıcının ID'si
      { age: 31 },   // Güncellenecek veri
      { new: true }  // Güncellenmiş veriyi döndür
    );
    console.log('Kullanıcı güncellendi:', updatedUser);  // Güncellenmiş kullanıcıyı konsola yazdırıyoruz
    */
    /* DELETE: Kullanıcıyı veritabanından siliyoruz
    await User.findByIdAndDelete(savedUser._id);  // Kullanıcıyı ID ile siliyoruz
    console.log('Kullanıcı silindi.');  // Silme işlemi tamamlandığında mesajı yazdırıyoruz
    */
    // Son olarak MongoDB bağlantısını kapatıyoruz
    mongoose.connection.close();
  } catch (err) {
    console.error('CRUD işlemleri hatası:', err);  // Hata durumunda mesajı konsola yazdırıyoruz
  }
}
