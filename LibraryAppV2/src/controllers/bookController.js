const Book = require('../models/Book');
const { addDocument, updateDocument, deleteDocument, search } = require('../services/elasticsearchService');
const { addLog } = require('../services/elasticsearchService'); // Log ekleme fonksiyonunu içe aktar

// Kitapları alma
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);

        // Log ekleme
        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: 'All books fetched successfully',
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kitapları alma hatası', error: error.message });

        // Hata loglama
        await addLog({
            id: `getAllBooks-${Date.now()}`,
            message: `Error fetching books: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

// Belirli bir kitabı alma
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }
        res.status(200).json(book);

        // Log ekleme
        await addLog({
            id: `getBookById-${Date.now()}`,
            message: `Book with ID ${req.params.id} fetched successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kitap alma hatası', error: error.message });

        // Hata loglama
        await addLog({
            id: `getBookById-${Date.now()}`,
            message: `Error fetching book with ID ${req.params.id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

// Yeni kitap oluşturma
exports.createBook = async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();

        // Elasticsearch'e doküman ekleme
        await addDocument(book._id.toString(), book);

        res.status(201).json(book);

        // Log ekleme
        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Book with ID ${book._id} created successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Kitap oluşturma hatası', error: error.message });

        // Hata loglama
        await addLog({
            id: `createBook-${Date.now()}`,
            message: `Error creating book: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

// Kitap güncelleme
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }

        // Elasticsearch dokümanını güncelleme
        await updateDocument(book._id.toString(), book);

        res.status(200).json(book);

        // Log ekleme
        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `Book with ID ${book._id} updated successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
<<<<<<< HEAD

=======
        
>>>>>>> 6e8dc84368b64cba54e6c2dbc238d186907a935e
        // Hata MongoDB veya doğrulama hatası ise 400, aksi takdirde 500 döndür
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            res.status(400).json({ message: 'Geçersiz veri formatı', error: error.message });
        } else {
            res.status(500).json({ message: 'Sunucu hatası', error: error.message });
        }
<<<<<<< HEAD

        // Hata loglama
        await addLog({
            id: `updateBook-${Date.now()}`,
            message: `Error updating book with ID ${req.params.id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
=======
>>>>>>> 6e8dc84368b64cba54e6c2dbc238d186907a935e
    }
};

// Kitap silme
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Kitap bulunamadı' });
        }

        // Elasticsearch dokümanını silme
        await deleteDocument(book._id.toString());

        res.status(204).json({ message: 'Kitap silindi' });

        // Log ekleme
        await addLog({
            id: `deleteBook-${Date.now()}`,
            message: `Book with ID ${req.params.id} deleted successfully`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kitap silme hatası', error: error.message });

        // Hata loglama
        await addLog({
            id: `deleteBook-${Date.now()}`,
            message: `Error deleting book with ID ${req.params.id}: ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};

// Kitap arama
exports.searchBooks = async (req, res) => {
    try {
        const query = req.query.q; // Arama sorgusunu almak için
        const results = await search(query);
        res.status(200).json(results);

        // Log ekleme
        await addLog({
            id: `searchBooks-${Date.now()}`,
            message: `Search performed with query: ${query}`,
            level: 'info',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Arama hatası', error: error.message });

        // Hata loglama
        await addLog({
            id: `searchBooks-${Date.now()}`,
            message: `Error performing search with query: ${query} - ${error.message}`,
            level: 'error',
            timestamp: new Date().toISOString()
        });
    }
};
