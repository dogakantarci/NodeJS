//app.js
const express = require('express');
const morgan = require('morgan');  // Morgan'ı içe aktar
const connectDB = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const helmet = require('helmet');
const { exec } = require('child_process'); // Komutları çalıştırmak için ekle

const app = express();

connectDB(); // Veritabanına bağlan

app.use(morgan('combined'));  // 'combined' formatında loglama yapar

// Helmet middleware'ini ekle
app.use(helmet());

// Middleware
app.use(express.json());  // Express'in yerleşik JSON middleware'i

// Anasayfa rotası
app.get('/', (req, res) => {
    res.send('Anasayfaya hoş geldiniz!');
});

// Webhook endpoint'i 
app.post('/github-webhook', (req, res) => {
    const payload = req.body;

    // PR'ın kapatıldığını kontrol et
    if (payload.action === 'closed' && payload.pull_request.merged) {
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
  

// Rotaları tanımla
app.use('/search', searchRoutes);  // Arama rotasını tanımlayın
app.use('/books', bookRoutes);
app.use('/auth', authRoutes);

module.exports = app;
