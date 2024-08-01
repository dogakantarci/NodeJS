const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bookRoutes = require('./routes'); // routes.js dosyasını içe aktar
const dotenv = require('dotenv');

// .env dosyasını yükle
dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB'ye bağlanma
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB bağlandı'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Rotaları kök rotaya bağlama
app.use('/', bookRoutes);

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
