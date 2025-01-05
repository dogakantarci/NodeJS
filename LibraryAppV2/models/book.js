const { Model, DataTypes } = require('sequelize');
const sequelize = require('../src/config/db');  // sequelize bağlantısını içeri alıyoruz

class Book extends Model {}

Book.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    publishedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: true, // Zorunlu değil
    },
  },
  {
    sequelize,  // sequelize bağlantısını model ile ilişkilendiriyoruz
    modelName: 'Book',  // Modelin adı
    timestamps: true,  // createdAt ve updatedAt otomatik eklenir
  }
);

module.exports = Book;
