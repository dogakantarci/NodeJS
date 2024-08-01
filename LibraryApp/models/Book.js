const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    publishedDate: { type: Date, required: true },
    genre: { type: String }
}, {
    timestamps: true,
    toJSON: { getters: true }
});

// UTC+3 dönüşüm fonksiyonu
function convertUTCToLocal(date) {
    const offset = 3 * 60 * 60 * 1000; // UTC+3 için saat farkı
    return new Date(date.getTime() + offset);
}

// Getter fonksiyonları
bookSchema.path('createdAt').get(function(date) {
    return convertUTCToLocal(date).toISOString();
});

bookSchema.path('updatedAt').get(function(date) {
    return convertUTCToLocal(date).toISOString();
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
