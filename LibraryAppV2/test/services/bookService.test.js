const sinon = require('sinon')
const bookService = require('../../src/services/bookService.js');
const bookModel = require('../../src/models/Book.js');

describe('Book Service Tests', () => {

  afterEach(() => {
    // Restore any stubbed methods after each test to avoid conflicts between tests
    sinon.restore();
  });

  test('should get all books', async () => {
    // Mock the model's method
    const mockBooks = [{ title: 'Book 1' }, { title: 'Book 2' }];
    sinon.stub(bookModel, 'find').returns(mockBooks);

    const books = await bookService.getAllBooks();
    expect(books).toEqual(mockBooks);
  });

  test('should get a book by ID', async () => {
    const mockBook = { title: 'Mock Book', author: 'Author' };
    sinon.stub(bookModel, 'findById').returns(mockBook);

    const book = await bookService.getBookById('mockId');
    expect(book).toEqual(mockBook);
  });

  test('should add a new book', async () => {
    const newBook = { title: 'New Book', author: 'New Author' };
    const saveStub = sinon.stub(bookModel.prototype, 'save').returns(newBook);

    const createdBook = await bookService.createBook(newBook);
    expect(createdBook).toEqual(newBook);
    expect(saveStub.calledOnce).toBe(true);
  });

  test('should update a book by ID', async () => {
    const updatedBook = { title: 'Updated Book' };
    sinon.stub(bookModel, 'findByIdAndUpdate').returns(updatedBook);

    const result = await bookService.updateBook('mockId', updatedBook);
    expect(result).toEqual(updatedBook);
  });

  test('should delete a book by ID', async () => {
    const deleteStub = sinon.stub(bookModel, 'findByIdAndDelete').returns(true);

    const result = await bookService.deleteBook('mockId');
    expect(result).toBe(true);
    expect(deleteStub.calledOnceWith('mockId')).toBe(true);
  });
});
