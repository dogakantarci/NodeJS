// elasticsearch.config.js
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
  ssl: {
    rejectUnauthorized: false, // SSL sertifikasını doğrulamamak için
  },
});

module.exports = client;
