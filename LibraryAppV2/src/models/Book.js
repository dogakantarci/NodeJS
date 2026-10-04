const { sequelize } = require('../config/db'); // Sequelize instance'ı merkezi olarak alınıyor
const { Model, DataTypes } = require('sequelize');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// Kullanıcının saat dilimini al
const userTimeZone = dayjs.tz.guess() || 'UTC';

// Zaman dilimini UTC'ye göre dönüştür
function convertUTCToLocal(date) {
  if (!date) return null;
  return dayjs(date).tz(userTimeZone).format(); // Kullanıcının saat dilimine dönüştür
}

class Book extends Model {
  toJSON() {
    const attributes = { ...this.get() };
    // createdAt ve updatedAt'ı kullanıcı saat dilimine çevir
    if (attributes.createdAt) {
      attributes.createdAt = convertUTCToLocal(attributes.createdAt);
    }
    if (attributes.updatedAt) {
      attributes.updatedAt = convertUTCToLocal(attributes.updatedAt);
    }
    return attributes;
  }
}

Book.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Bu zaten otomatik olarak index oluşturur
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publishedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Book',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',

    indexes: [
      {
        name: 'idx_books_title',
        fields: ['title'],
      },
      {
        name: 'idx_books_author',
        fields: ['author'],
      },
      {
        name: 'idx_books_createdAt',
        fields: ['createdAt'],
      },
      {
        name: 'idx_books_genre',
        fields: ['genre'],
      },
    ],
  }
);

module.exports = Book;
