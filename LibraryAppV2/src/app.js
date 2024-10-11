//app.js
const express = require('express');
const morgan = require('morgan');  // Morgan'ı içe aktar
const connectDB = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const helmet = require('helmet');


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
    console.log('Webhook verisi geldi:', req.body);
    res.status(200).send('Webhook alındı!');
  });
  

// Rotaları tanımla
app.use('/search', searchRoutes);  // Arama rotasını tanımlayın
app.use('/books', bookRoutes);
app.use('/auth', authRoutes);

module.exports = app;
