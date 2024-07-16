const express = require('express');
const app = express();
const port = 3000;

// Middleware işlevi
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/about', (req, res) => {
    res.send('Bu bir hakkında sayfasıdır.');
});

app.get('/contact', (req, res) => {
    res.send('Bu bir iletişim sayfasıdır.');
});

app.get('/', (req, res) => {
    res.send('Hoşgeldiniz!');
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
