module.exports = {
    development: {
      username: 'library_user',
      password: 'library_password', // PostgreSQL kullanıcı şifrenizi buraya yazın
      database: 'libraryapp',
      host: 'localhost',
      dialect: 'postgres',
    },
    test: {
      username: 'postgres',
      password: '1',
      database: 'libraryapp_test',
      host: 'localhost',
      dialect: 'postgres',
    },
    production: {
      username: 'postgres',
      password: '1',
      database: 'libraryapp_prod',
      host: 'localhost',
      dialect: 'postgres',
    }
  };
  