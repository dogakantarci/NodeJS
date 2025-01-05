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
  return dayjs(date).tz(userTimeZone).format();  // Kullanıcının saat dilimine dönüştür
}

module.exports = (sequelize) => {  // sequelize parametresini al
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
        unique: true,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      publishedDate: {
        type: DataTypes.DATE,
        allowNull: true, // Yazarın belirtmediği bir tarih olabilir
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: true, // Zorunlu değil
      },
    },
    {
      sequelize, // sequelize nesnesi burada kullanılmalı
      modelName: 'Book',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return Book;
};
