// server.js
const dotenv = require('dotenv');
dotenv.config();  // .env dosyasını yükle

const app = require('./src/app');  // app.js'i içe aktar

const port = process.env.PORT || 3000;

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
