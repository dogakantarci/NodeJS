const sinon = require('sinon');
const bookService = require('../../src/services/bookService');
const BookController = require('../../src/controllers/bookController');

describe('BookController', () => {
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
            sinon.stub(bookService, 'getAllBooks').resolves(books);

            await BookController.getAllBooks(req, res, next);

            expect(res.status.calledWith(200)).toBe(true);
            expect(res.json.calledWith(books)).toBe(true);
        });

        it('should handle errors', async () => {
            const error = new Error('Some error');
            sinon.stub(bookService, 'getAllBooks').rejects(error);

            await BookController.getAllBooks(req, res, next);

            expect(res.status.calledWith(500)).toBe(true);
            expect(res.json.calledWith({ message: 'Kitapları alma hatası', error: error.message })).toBe(true);
        });
    });

    describe('getBookById', () => {
        it('should return a book by ID', async () => {
            const book = { _id: '60c72b2f9b1d8c3b4c8d9b9a', title: 'Book 1' };
            req.params.id = book._id;
            sinon.stub(bookService, 'getBookById').resolves(book);

            await BookController.getBookById(req, res, next);

            expect(res.status.calledWith(200)).toBe(true);
            expect(res.json.calledWith(book)).toBe(true);
        });

        it('should handle book not found', async () => {
            req.params.id = '60c72b2f9b1d8c3b4c8d9b9a';
            sinon.stub(bookService, 'getBookById').resolves(null);

            await BookController.getBookById(req, res, next);

            expect(res.status.calledWith(404)).toBe(true);
            expect(res.json.calledWith({ message: 'Kitap bulunamadı' })).toBe(true);
        });

        it('should handle errors', async () => {
            const error = new Error('Some error');
            req.params.id = '60c72b2f9b1d8c3b4c8d9b9a';
            sinon.stub(bookService, 'getBookById').rejects(error);

            await BookController.getBookById(req, res, next);

            expect(res.status.calledWith(500)).toBe(true);
            expect(res.json.calledWith({ message: 'Bir hata oluştu', error: error.message })).toBe(true);
        });
    });

    describe('createBook', () => {
        it('should create a book', async () => {
            const bookData = { title: 'New Book', author: 'Author' };
            const savedBook = { _id: '60c72b2f9b1d8c3b4c8d9b9a', ...bookData };
            req.body = bookData;
            sinon.stub(bookService, 'createBook').resolves(savedBook);

            await BookController.createBook(req, res, next);

            expect(res.status.calledWith(201)).toBe(true);
            expect(res.json.calledWith(savedBook)).toBe(true);
        });

        it('should handle errors while creating book', async () => {
            const error = new Error('Some error');
            req.body = { title: 'New Book', author: 'Author' };
            sinon.stub(bookService, 'createBook').rejects(error);

            await BookController.createBook(req, res, next);

            expect(res.status.calledWith(400)).toBe(true);
            expect(res.json.calledWith({ message: 'Kitap oluşturma hatası', error: error.message })).toBe(true);
        });
    });

    describe('updateBook', () => {
        it('should update a book', async () => {
            const bookId = '60c72b2f9b1d8c3b4c8d9b9a';
            const updatedBook = { _id: bookId, title: 'Updated Book' };
            req.params.id = bookId;
            req.body = { title: 'Updated Book' };
            sinon.stub(bookService, 'updateBook').resolves(updatedBook);

            await BookController.updateBook(req, res, next);

            expect(res.status.calledWith(200)).toBe(true);
            expect(res.json.calledWith(updatedBook)).toBe(true);
        });

        it('should handle errors while updating', async () => {
            const error = new Error('Some error');
            req.params.id = '60c72b2f9b1d8c3b4c8d9b9a';
            req.body = { title: 'Updated Book' };
            sinon.stub(bookService, 'updateBook').rejects(error);

            await BookController.updateBook(req, res, next);

            expect(res.status.calledWith(500)).toBe(true);
            expect(res.json.calledWith({ message: 'Sunucu hatası', error: error.message })).toBe(true);
        });
    });

    describe('deleteBook', () => {
        it('should delete a book', async () => {
            req.params.id = '60c72b2f9b1d8c3b4c8d9b9a';
            sinon.stub(bookService, 'deleteBook').resolves(true);

            await BookController.deleteBook(req, res, next);

            expect(res.status.calledWith(204)).toBe(true);
            expect(res.json.calledWith({ message: 'Kitap silindi' })).toBe(true);
        });

        it('should handle errors while deleting', async () => {
            const error = new Error('Some error');
            req.params.id = '60c72b2f9b1d8c3b4c8d9b9a';
            sinon.stub(bookService, 'deleteBook').rejects(error);

            await BookController.deleteBook(req, res, next);

            expect(res.status.calledWith(500)).toBe(true);
            expect(res.json.calledWith({ message: 'Kitap silme hatası', error: error.message })).toBe(true);
        });
    });
});
