const sinon = require('sinon');
const BookController = require('../../src/controllers/bookController');
const bookService = require('../../src/services/bookService');
const elasticsearchService = require('../../src/services/elasticsearchService');
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
        it('should return all books and log the event', async () => {
            const books = [{ title: 'Book 1' }, { title: 'Book 2' }];
            sandbox.stub(bookService, 'getAllBooks').resolves(books);
            sandbox.stub(elasticsearchService, 'addLog').resolves();

            await BookController.getAllBooks(req, res, next);

            sinon.assert.calledOnce(bookService.getAllBooks);
            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, books);
        });

        it('should handle errors and pass them to next middleware', async () => {
            const error = new Error('Database error');
            sandbox.stub(bookService, 'getAllBooks').rejects(error);
            sandbox.stub(elasticsearchService, 'addLog').resolves();

            await BookController.getAllBooks(req, res, next);

            // Özel hata sınıfını kontrol et
            sinon.assert.calledOnce(next);
            sinon.assert.calledWith(next, sinon.match.instanceOf(InternalServerErrorException));
        });
    });

    describe('createBook', () => {
        it('should create a book and log the event', async () => {
            const newBook = { title: 'New Book', author: 'Author' };
            const createdBook = { _id: '123', ...newBook };

            req.body = newBook;
            sandbox.stub(bookService, 'createBook').resolves(createdBook);
            sandbox.stub(elasticsearchService, 'addLog').resolves();

            await BookController.createBook(req, res, next);

            sinon.assert.calledOnce(bookService.createBook);
            sinon.assert.calledWith(bookService.createBook, newBook);
            sinon.assert.calledWith(res.status, 201);
            sinon.assert.calledWith(res.json, createdBook);
        });

        it('should handle errors while creating book', async () => {
            const error = new Error('Some error');
            req.body = { title: 'New Book', author: 'Author' };

            const bookInstance = new Book(req.body);
            sinon.stub(bookInstance, 'save').rejects(error);

            await BookController.createBook(req, res, next);

            sinon.assert.calledOnce(next);
            sinon.assert.calledWith(next, sinon.match.instanceOf(InternalServerErrorException));
        });

        it('should handle validation errors and pass them to next middleware', async () => {
            req.body = {}; // Eksik veriler
            sandbox.stub(bookService, 'createBook').rejects(new Error('Validation error'));

            await BookController.createBook(req, res, next);

            // Özel hata sınıfını kontrol et
            sinon.assert.calledOnce(next);
            sinon.assert.calledWith(next, sinon.match.instanceOf(BadRequestException));
        });
    });

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

        it('should handle validation errors and pass them to next middleware', async () => {
            req.body = {}; // Eksik veriler
            sandbox.stub(bookService, 'createBook').rejects(new Error('Validation error'));

            await BookController.createBook(req, res, next);

            // Özel hata sınıfını kontrol et
            sinon.assert.calledOnce(next);
            sinon.assert.calledWith(next, sinon.match.instanceOf(BadRequestException));
        });
    });
});
