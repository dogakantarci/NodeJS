const { sequelize } = require('../config/db'); // Sequelize instance'ı merkezi olarak alınıyor
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class User extends Model {
  // Şifreyi doğrulama metodu
  async comparePassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    sequelize, // Sequelize instance doğrudan kullanılıyor
    modelName: 'User',
    timestamps: true, // createdAt ve updatedAt alanları otomatik eklenir
    hooks: {
      async beforeSave(user) {
        // Eğer password değiştiyse, hash'leme işlemi yapılır
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User; // Model doğrudan export ediliyor
