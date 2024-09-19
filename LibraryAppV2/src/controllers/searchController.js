//searchController.js
const { search } = require('../services/elasticsearchService');

exports.searchDocuments = async (req, res) => {
    try {
        const { query } = req.query;
        const results = await search(query);
        res.status(200).json(results);
    } catch (error) {
        console.error('Arama hatası:', error);
        res.status(500).json({ message: 'Arama hatası', error: error.message });
    }
};
