//elasticsearchService.js
require('dotenv').config(); // Ortam değişkenlerini yükler
const { Client } = require('@elastic/elasticsearch');

// Elasticsearch istemcisini yapılandır
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

// Elasticsearch dizinini kontrol eden ve oluşturan fonksiyon
async function createIndex() {
    const indexName = 'logs';

    try {
        const exists = await client.indices.exists({ index: indexName });
        if (exists.body) {
            console.log(`Dizin zaten mevcut: ${indexName}`);
            return;
        }

        await client.indices.create({
            index: indexName,
            body: {
                mappings: {
                    properties: {
                        timestamp: {
                            type: 'date', // Log kaydı için zaman damgası
                        },
                        level: {
                            type: 'keyword', // Log seviyesini (info, error, vs.) belirtir
                        },
                        message: {
                            type: 'text', // Log mesajı
                        },
                        service: {
                            type: 'keyword', // Log kaydını oluşturan servisi belirtir
                        },
                        context: {
                            type: 'object', // Log kaydının bağlam bilgileri
                        }
                    }
                }
            }
        });
        console.log(`Dizin oluşturuldu: ${indexName}`);
    } catch (error) {
        console.error('Dizin oluşturma hatası:', error);
    }
}



// Doküman ekleme fonksiyonu
async function addDocument(id, body) {
    try {
        await client.index({
            index: 'books',
            id: id,
            body: body
        });
        console.log('Doküman eklendi');
    } catch (error) {
        console.error('Doküman ekleme hatası:', error.message, error.stack);
    }
}

// Arama fonksiyonu
async function search(query) {
    try {
        const result = await client.search({
            index: 'books',
            body: {
                query: {
                    match: { title: query } // Örneğin başlık içinde arama yapar
                }
            }
        });
        return result.body.hits.hits;
    } catch (error) {
        console.error('Arama hatası:', error.message, error.stack);
        return [];
    }
}

// Veriyi güncelleme fonksiyonu
async function updateDocument(id, body) {
    try {
        await client.update({
            index: 'books',
            id: id,
            body: {
                doc: body
            }
        });
        console.log('Doküman güncellendi');
    } catch (error) {
        console.error('Doküman güncelleme hatası:', error.message, error.stack);
    }
}

// Veriyi silme fonksiyonu
async function deleteDocument(id) {
    try {
        await client.delete({
            index: 'books',
            id: id
        });
        console.log('Doküman silindi');
    } catch (error) {
        console.error('Doküman silme hatası:', error.message, error.stack);
    }
}


// Log ekleme fonksiyonu
async function addLog(logBody) {
    try {
        await client.index({
            index: 'logs', // Logları saklayacağınız indeks adı
            body: logBody
        });
        console.log('Log eklendi');
    } catch (error) {
        console.error('Log ekleme hatası:', error.message, error.stack);
    }
}
module.exports = { addLog, createIndex, addDocument, search, updateDocument, deleteDocument };
