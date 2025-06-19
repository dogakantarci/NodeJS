// quickTest.js - Proje root dizininde çalıştırın
console.log('🚀 Kütüphane Projesi - Transaction Helper Testi\n');

try {
  // 1. Database config yükleme testi
  console.log('📦 Database config yükleniyor...');
  const { sequelize } = require('./config/db');
  console.log('✅ Database config başarıyla yüklendi!');
  console.log('🔧 Sequelize instance:', !!sequelize);
  
  // 2. TransactionHelper yükleme testi
  console.log('\n📦 TransactionHelper yükleniyor...');
  const { withTransaction } = require('./utils/transactionHelper');
  console.log('✅ TransactionHelper başarıyla yüklendi!');
  console.log('🔧 withTransaction tipi:', typeof withTransaction);
  
  // 3. Model yükleme testi (varsa)
  try {
    console.log('\n📦 User model test ediliyor...');
    const User = require('./models/User');
    console.log('✅ User model mevcut');
  } catch (error) {
    console.log('⚠️ User model yüklenemedi:', error.message);
  }
  
  try {
    console.log('📦 Book model test ediliyor...');
    const Book = require('./models/Book');
    console.log('✅ Book model mevcut');
  } catch (error) {
    console.log('⚠️ Book model yüklenemedi:', error.message);
  }
  
  console.log('\n🎉 Temel yükleme testleri başarılı!');
  console.log('\n📋 Sonraki adımlar:');
  console.log('1. node detailedTest.js (database bağlantısı ile test)');
  console.log('2. TransactionHelper artık controller\'larınızda kullanılabilir!');
  
} catch (error) {
  console.error('❌ Hata:', error.message);
  console.error('\n🔍 Olası çözümler:');
  console.error('1. npm install sequelize pg çalıştırın');
  console.error('2. PostgreSQL container\'ının çalıştığından emin olun');
  console.error('3. config/db.js dosyasındaki bağlantı bilgilerini kontrol edin');
}

console.log('\n✨ Hızlı test tamamlandı.');