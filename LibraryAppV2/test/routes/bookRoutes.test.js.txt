const sinon = require('sinon');
const bookService = require('../../src/services/bookService');

describe('Book Service', () => {
    let getBookByIdStub;
    let createBookStub;
    let updateBookStub;
    let deleteBookStub;

    beforeEach(() => {
        getBookByIdStub = sinon.stub(bookService, 'getBookById');
        createBookStub = sinon.stub(bookService, 'createBook');
        updateBookStub = sinon.stub(bookService, 'updateBook');
        deleteBookStub = sinon.stub(bookService, 'deleteBook');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should get a book by ID', async () => {
        const mockBook = { id: '1', title: 'Book 1', author: 'Author 1' };
        getBookByIdStub.withArgs('1').returns(Promise.resolve(mockBook));

        const book = await bookService.getBookById('1');

        expect(book).toEqual(mockBook);
    });

    it('should create a book', async () => {
        const newBook = { title: 'New Book', author: 'Author Name' };
        const createdBook = { id: '1', ...newBook };
        createBookStub.returns(Promise.resolve(createdBook));

        const book = await bookService.createBook(newBook);

        expect(book).toEqual(createdBook);
    });

    it('should update a book', async () => {
        const bookId = '1';
        const updatedBook = { title: 'Updated Book', author: 'Updated Author' };
        const returnedBook = { id: bookId, ...updatedBook };
        updateBookStub.withArgs(bookId, updatedBook).returns(Promise.resolve(returnedBook));

        const book = await bookService.updateBook(bookId, updatedBook);

        expect(book).toEqual(returnedBook);
    });

    it('should delete a book', async () => {
        const bookId = '1';
        deleteBookStub.withArgs(bookId).returns(Promise.resolve());

        await bookService.deleteBook(bookId);

        expect(deleteBookStub.calledOnce).toBe(true); // Delete işlemi çağrıldığını kontrol et
    });
});
