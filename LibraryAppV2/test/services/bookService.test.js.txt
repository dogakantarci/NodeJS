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

  test('should return null if book not found by ID', async () => {
    sinon.stub(bookModel, 'findById').resolves(null);

    const book = await bookService.getBookById('nonExistingId');
    expect(book).toBeNull();
  });

  test('should throw an error when required fields are missing', async () => {
    const incompleteBook = { author: 'New Author' }; // `title` missing
    await expect(bookService.createBook(incompleteBook)).rejects.toThrow();
  });
  test('should return null when trying to update a non-existing book', async () => {
    sinon.stub(bookModel, 'findByIdAndUpdate').resolves(null);

    const result = await bookService.updateBook('nonExistingId', { title: 'New Title' });
    expect(result).toBeNull();
  });


  test('should return false when trying to delete a non-existing book', async () => {
    sinon.stub(bookModel, 'findByIdAndDelete').resolves(null);

    const result = await bookService.deleteBook('nonExistingId');
    expect(result).toBeNull();
  });

  test('should handle errors from the model methods', async () => {
    const errorMessage = 'Database error';
    sinon.stub(bookModel, 'find').throws(new Error(errorMessage));

    await expect(bookService.getAllBooks()).rejects.toThrow(errorMessage);
  });

  test('should return an empty array when no books are available', async () => {
    sinon.stub(bookModel, 'find').resolves([]);
    
    const books = await bookService.getAllBooks();
    expect(books).toEqual([]);
  });

  test('should throw an error when an invalid ID format is provided for update', async () => {
    await expect(bookService.updateBook('invalidId', { title: 'New Title' })).rejects.toThrow();
  });

  test('should delete an existing book by ID', async () => {
    sinon.stub(bookModel, 'findByIdAndDelete').resolves(true);

    const result = await bookService.deleteBook('existingId');
    expect(result).toBe(true);
  });

  test('should handle errors when adding a book', async () => {
    const errorMessage = 'Database error';
    sinon.stub(bookModel.prototype, 'save').throws(new Error(errorMessage));

    await expect(bookService.createBook({ title: 'New Book', author: 'Author' })).rejects.toThrow(errorMessage);
  });
  test('should return updated book when update is successful', async () => {
    const updatedBook = { title: 'Updated Book' };
    sinon.stub(bookModel, 'findByIdAndUpdate').resolves(updatedBook);

    const result = await bookService.updateBook('existingId', updatedBook);
    expect(result).toEqual(updatedBook);
  });
});
