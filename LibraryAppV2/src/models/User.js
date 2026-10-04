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
      unique: true, // unique zaten index oluşturur
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
    sequelize,
    modelName: 'User',
    timestamps: true,

    indexes: [
      {
        name: 'idx_users_username',
        fields: ['username'],
      },
    ],

    hooks: {
      async beforeSave(user) {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);


module.exports = User; // Model doğrudan export ediliyor
