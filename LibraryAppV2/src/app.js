const express = require('express');
const connectDB = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');

// Veritabanına bağlan
connectDB();

const app = express();

// Middleware
app.use(express.json());  // Express'in yerleşik JSON middleware'i

// Anasayfa rotası
app.get('/', (req, res) => {
    res.send('Anasayfaya hoş geldiniz!');
});

// Rotaları tanımla
app.use('/books', bookRoutes);
app.use('/auth', authRoutes);

module.exports = app;
