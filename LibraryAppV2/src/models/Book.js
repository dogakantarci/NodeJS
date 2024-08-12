// src/models/Book.js
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Kullanıcının saat dilimini çekiyoruz
const userTimeZone = dayjs.tz.guess();

// Zaman dilimini UTC'ye göre dönüştür
function convertUTCToLocal(date) {
    return dayjs(date).tz(userTimeZone).format();  // Kullanıcının saat dilimine çevirir
}

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    publishedDate: { type: Date },
    genre: { type: String }
}, {
    timestamps: true,
    toJSON: { getters: true }
});

// Getter fonksiyonları
bookSchema.path('createdAt').get(function(date) {
    return convertUTCToLocal(date);
});

bookSchema.path('updatedAt').get(function(date) {
    return convertUTCToLocal(date);
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
