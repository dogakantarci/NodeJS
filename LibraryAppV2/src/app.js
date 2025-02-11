//app.js
const express = require('express');
const morgan = require('morgan');  // Morgan'ı içe aktar
const sequelize = require('./config/db'); // Veritabanı bağlantısı
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
//const searchRoutes = require('./routes/searchRoutes');
const helmet = require('helmet');
const { exec } = require('child_process'); // Komutları çalıştırmak için ekle
const { errorHandler } = require('./middleware/errorHandler');
const cors = require("cors");

const app = express();

// Veritabanı senkronizasyonu
const syncDatabase = async () => {
    try {
      await sequelize.sync({ force: false });  // `force: false` ile tablolara zarar verilmez
      console.log('Veritabanı senkronize edildi.');
    } catch (error) {
      console.error('Senkronizasyon hatası:', error);
    }
  };
  
  syncDatabase();

app.use(morgan('combined'));  // 'combined' formatında loglama yapar
app.use(cors()); // Tüm kaynaklara izin verir (Güvenlik için gelişmiş ayarlar yapacağız)

// Helmet middleware'ini ekle
app.use(helmet());

app.use(express.json());  // Express'in yerleşik JSON middleware'i

// Anasayfa rotası
app.get('/', (req, res) => {
    res.send('Anasayfaya hoş geldiniz!');
});

// Webhook endpoint'i 
app.post('/github-webhook', (req, res) => {
    const { action, pull_request } = req.body;

    // PR'ın kapatıldığını kontrol et
    if (action === 'closed' && pull_request.merged) {
        console.log('Pull Request merged, deployment starting...');

        // Git pull ve sunucuyu yeniden başlatma
        exec('git pull origin main && npm install && pm2 restart all', (err, stdout, stderr) => {
            if (err) {
                console.error(`Deployment hatası: ${stderr}`);
                return res.status(500).send('Deployment başarısız oldu.');
            }

            console.log(`Deployment başarılı: ${stdout}`);
            res.status(200).send('Deployment tamamlandı.');
        });
    } else {
        res.status(200).send('Bu bir merge edilmiş PR değil.');
    }
});


// Rotaları tanımlayalım
app.use('/search', bookRoutes);  // Arama rotasını tanımlayın
app.use('/books', bookRoutes);
app.use('/auth', authRoutes);
app.use('/filter', bookRoutes);

app.use(errorHandler);

module.exports = app;