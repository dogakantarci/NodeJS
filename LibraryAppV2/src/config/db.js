// config/db.js
const { Sequelize } = require('sequelize');

// PostgreSQL veritabanına bağlanma
const sequelize = new Sequelize({
  dialect: 'postgres', // Veritabanı türü
  host: 'my-postgres', // PostgreSQL hostu
  username: 'library_user',
  password: 'library_password',
  database: 'library',
});

// Modelleri import et
const User = require('../models/User');
const Book = require('../models/Book');

// Bağlantıyı ve senkronizasyonu test et
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL bağlantısı başarılı!');

    // Tabloları senkronize et
    await sequelize.sync({ force: false });
    console.log('Veritabanı senkronize edildi');
  } catch (error) {
    console.error('Bağlantı veya senkronizasyon hatası:', error.message);
  }
};

testConnection();

module.exports = {sequelize};
