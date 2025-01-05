const Redis = require('ioredis');

// Redis'e bağlanmak için yeni bir Redis örneği oluşturun
const redis = new Redis({
  host: 'my-redis',  // Docker Compose içindeki Redis servis adı
  port: 6379,        // Redis sunucusunun portu
  db: 0              // Kullanmak istediğiniz veritabanı (varsayılan: 0)
});

// Bağlantının başarılı olduğunu kontrol et
redis.on('connect', () => {
  console.log('Redis bağlantısı başarılı');
});

redis.on('error', (err) => {
  console.log('Redis bağlantı hatası:', err);
});

module.exports = redis;
