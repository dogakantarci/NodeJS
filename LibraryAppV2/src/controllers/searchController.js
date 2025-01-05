// searchController.js
const { search } = require('../services/elasticsearchService'); // Elasticsearch arama servisini içe aktar

// Arama belgelerini yöneten kontrolcü fonksiyonu
exports.searchDocuments = async (req, res) => {
    try {
        // İstekten alınan sorgu parametresini ayır
        const { query } = req.query;

        // Elasticsearch servisini kullanarak arama yap
        const results = await search(query);

        // Başarılı arama sonucunu JSON formatında döndür
        res.status(200).json(results);
    } catch (error) {
        // Hata durumunda konsola hata mesajını yazdır
        console.error('Arama hatası:', error);

        // Hata mesajı ile birlikte 500 durum kodu döndür
        res.status(500).json({ message: 'Arama hatası', error: error.message });
    }
};
