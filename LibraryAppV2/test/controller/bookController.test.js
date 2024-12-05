const sinon = require('sinon');
const BookController = require('../../src/controllers/bookController');
const bookService = require('../../src/services/bookService');
const { InternalServerErrorException, BadRequestException } = require('../../src/exceptions/HttpException'); // Hata sınıfları

describe('BookController Unit Tests', () => {
    let sandbox;
    let req, res, next;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        req = { body: {}, params: {}, query: {} };
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
        };
        next = sandbox.stub();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getAllBooks', () => {
        it('should return all books', async () => {
            const books = [{ title: 'Book 1' }, { title: 'Book 2' }];
            sandbox.stub(bookService, 'getAllBooks').resolves(books);

            await BookController.getAllBooks(req, res, next);

            sinon.assert.calledOnce(bookService.getAllBooks);
            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, books);
        });

        it('should handle errors and pass them to next middleware', async () => {
            const error = new Error('Database error');
            sandbox.stub(bookService, 'getAllBooks').rejects(error);

            await BookController.getAllBooks(req, res, next);

            sinon.assert.calledOnce(next);
            sinon.assert.calledWith(next, sinon.match.instanceOf(InternalServerErrorException));
        });

        it('should return empty array when no books exist', async () => {
            sandbox.stub(bookService, 'getAllBooks').resolves([]);

            await BookController.getAllBooks(req, res, next);

            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, []);
        });
    });

    describe('createBook', () => {
        it('should create a book', async () => {
            const newBook = { title: 'New Book', author: 'Author' };
            const createdBook = { _id: '123', ...newBook };

            req.body = newBook;
            sandbox.stub(bookService, 'createBook').resolves(createdBook);

            await BookController.createBook(req, res, next);

            sinon.assert.calledOnce(bookService.createBook);
            sinon.assert.calledWith(bookService.createBook, newBook);
            sinon.assert.calledWith(res.status, 201);
            sinon.assert.calledWith(res.json, createdBook);
        });

        it('should handle validation errors and pass them to next middleware', async () => {
            req.body = {}; // Eksik veriler
            sandbox.stub(bookService, 'createBook').rejects(new Error('Validation error'));

            await BookController.createBook(req, res, next);

            sinon.assert.calledOnce(next);
            sinon.assert.calledWith(next, sinon.match.instanceOf(BadRequestException));
            sinon.assert.calledWith(next, sinon.match.has('message', 'Tüm alanlar gereklidir: title, author, publishedDate'));
        });
    });

    describe('updateBook', () => {
        it('should update a book', async () => {
            const bookId = '123';
            const updatedBook = { _id: bookId, title: 'Updated Book' };

            req.params.id = bookId;
            req.body = { title: 'Updated Book' };

            sandbox.stub(bookService, 'updateBook').resolves(updatedBook);

            await BookController.updateBook(req, res, next);

            sinon.assert.calledOnce(bookService.updateBook);
            sinon.assert.calledWith(bookService.updateBook, bookId, req.body);
            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, updatedBook);
        });

        it('should handle errors when updating a book', async () => {
            const bookId = '123';
            req.params.id = bookId;
            req.body = { title: 'Updated Book' };

            sandbox.stub(bookService, 'updateBook').rejects(new Error('Update error'));

            await BookController.updateBook(req, res, next);

            sinon.assert.calledOnce(next);
            sinon.assert.calledWith(next, sinon.match.instanceOf(InternalServerErrorException));
        });
    });
});
