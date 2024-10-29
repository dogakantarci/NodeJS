const sinon = require('sinon');
const mongoose = require('mongoose');
const BookController = require('../../src/controllers/bookController');
const Book = require('../../src/models/Book');

describe('BookController with Mongoose Mock', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        next = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getAllBooks', () => {
        it('should return all books', async () => {
            const books = [{ title: 'Book 1' }, { title: 'Book 2' }];
            sinon.stub(Book, 'find').resolves(books);

            await BookController.getAllBooks(req, res, next);

            expect(res.status.calledWith(200)).toBe(true);
            expect(res.json.calledWith(books)).toBe(true);
        });

        it('should handle errors', async () => {
            const error = new Error('Some error');
            sinon.stub(Book, 'find').rejects(error);

            await BookController.getAllBooks(req, res, next);

            expect(res.status.calledWith(500)).toBe(true);
            expect(res.json.calledWith({ message: 'Kitapları alma hatası', error: error.message })).toBe(true);
        });
    });

    describe('getBookById', () => {
        it('should return a book by ID', async () => {
            const book = { _id: new mongoose.Types.ObjectId(), title: 'Book 1' };
            req.params.id = book._id.toString();
            sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
            sinon.stub(Book, 'findById').resolves(book);

            await BookController.getBookById(req, res, next);

            expect(res.status.calledWith(200)).toBe(true);
            expect(res.json.calledWith(book)).toBe(true);
        });

        it('should handle invalid ID', async () => {
            req.params.id = 'invalid-id';
            sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(false);

            await BookController.getBookById(req, res, next);

            expect(res.status.calledWith(404)).toBe(true);
            expect(res.json.calledWith({ message: 'Geçersiz ID: Kitap bulunamadı' })).toBe(true);
        });

        it('should handle book not found', async () => {
            req.params.id = new mongoose.Types.ObjectId().toString();
            sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
            sinon.stub(Book, 'findById').resolves(null);

            await BookController.getBookById(req, res, next);

            expect(res.status.calledWith(404)).toBe(true);
            expect(res.json.calledWith({ message: 'Kitap bulunamadı' })).toBe(true);
        });

        it('should handle errors', async () => {
            const error = new Error('Some error');
            req.params.id = new mongoose.Types.ObjectId().toString();
            sinon.stub(mongoose.Types.ObjectId, 'isValid').returns(true);
            sinon.stub(Book, 'findById').rejects(error);

            await BookController.getBookById(req, res, next);

            expect(res.status.calledWith(500)).toBe(true);
            expect(res.json.calledWith({ message: 'Bir hata oluştu', error: error.message })).toBe(true);
        });
    });
/*
describe('createBook', () => {
    it('should create a book', async () => {
        const bookData = { title: 'New Book', author: 'Author' };
        req.body = bookData;
        const savedBook = { _id: new mongoose.Types.ObjectId(), ...bookData };

        // Book modelinin bir örneğini oluştur ve save metodunu stub'la
        const bookInstance = new Book(bookData);
        sinon.stub(bookInstance, 'save').resolves(savedBook);
        sinon.stub(Book, 'create').resolves(savedBook); // Eğer Book.create kullanıyorsan

        await BookController.createBook(req, res, next);

        expect(res.status.calledWith(201)).toBe(true);
        expect(res.json.calledWith(savedBook)).toBe(true);
    });

    it('should handle errors while creating book', async () => {
        const error = new Error('Some error');
        req.body = { title: 'New Book', author: 'Author' };

        const bookInstance = new Book(req.body);
        sinon.stub(bookInstance, 'save').rejects(error);

        await BookController.createBook(req, res, next);

        expect(res.status.calledWith(400)).toBe(true);
        expect(res.json.calledWith({ message: 'Kitap oluşturma hatası', error: error.message })).toBe(true);
    });
});*/

    describe('updateBook', () => {
        it('should update a book', async () => {
            const bookId = new mongoose.Types.ObjectId().toString();
            const updatedBook = { _id: bookId, title: 'Updated Book' };
            req.params.id = bookId;
            req.body = { title: 'Updated Book' };
            sinon.stub(Book, 'findByIdAndUpdate').resolves(updatedBook);

            await BookController.updateBook(req, res, next);

            expect(res.status.calledWith(200)).toBe(true);
            expect(res.json.calledWith(updatedBook)).toBe(true);
        });

        it('should handle errors while updating', async () => {
            const error = new Error('Some error');
            req.params.id = new mongoose.Types.ObjectId().toString();
            req.body = { title: 'Updated Book' };
            sinon.stub(Book, 'findByIdAndUpdate').rejects(error);

            await BookController.updateBook(req, res, next);

            expect(res.status.calledWith(500)).toBe(true);
            expect(res.json.calledWith({ message: 'Sunucu hatası', error: error.message })).toBe(true);
        });
    });

    describe('deleteBook', () => {
        it('should delete a book', async () => {
            req.params.id = new mongoose.Types.ObjectId().toString();
            sinon.stub(Book, 'findByIdAndDelete').resolves(true);

            await BookController.deleteBook(req, res, next);

            expect(res.status.calledWith(204)).toBe(true);
            expect(res.json.calledWith({ message: 'Kitap silindi' })).toBe(true);
        });

        it('should handle errors while deleting', async () => {
            const error = new Error('Some error');
            req.params.id = new mongoose.Types.ObjectId().toString();
            sinon.stub(Book, 'findByIdAndDelete').rejects(error);

            await BookController.deleteBook(req, res, next);

            expect(res.status.calledWith(500)).toBe(true);
            expect(res.json.calledWith({ message: 'Kitap silme hatası', error: error.message })).toBe(true);
        });
    });
});