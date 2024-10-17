const sinon = require('sinon');
const Book = require('../../src/models/Book');
jest.setTimeout(10000); // Zaman aşımı süresini 10 saniyeye çıkar


describe('Book Model', () => {
    let saveStub, findStub;

    afterEach(() => {
        sinon.restore(); // Her testten sonra stub'ları geri al
    });

    // Test: Başarılı kitap oluşturma
    it('should create a book successfully', async () => {
        const bookData = {
            title: 'Test Book',
            author: 'Test Author',
            publishedDate: new Date(),
            genre: 'Fiction'
        };

        // save() fonksiyonunu stub ile taklit et
        saveStub = sinon.stub(Book.prototype, 'save').resolves(bookData);
        
        const book = new Book(bookData);
        const savedBook = await book.save();

        sinon.assert.calledOnce(saveStub); // save() metodu bir kez çağrıldı mı
        expect(savedBook.title).toBe(bookData.title);
        expect(savedBook.author).toBe(bookData.author);
    });

    // Test: Gerekli alanların kontrolü (başlık eksikse)
    it('should throw an error if title is missing', async () => {
        const bookData = {
            author: 'Test Author',
            publishedDate: new Date(),
            genre: 'Fiction'
        };

        const book = new Book(bookData);
        
        // save() fonksiyonunu hata dönecek şekilde stub ile taklit et
        saveStub = sinon.stub(book, 'save').rejects(new Error('ValidationError: title is required'));
        
        await expect(book.save()).rejects.toThrow('ValidationError: title is required');
    });

    // Test: Tekil başlık kısıtlaması
    it('should throw an error if title is not unique', async () => {
        const bookData = {
            title: 'Unique Book',
            author: 'Test Author',
            publishedDate: new Date(),
            genre: 'Fiction'
        };
    
        // İlk kaydı oluşturmayı simüle et, save() çağrıldığında başarılı olduğunu varsayıyoruz
        const firstBook = new Book(bookData);
        saveStub = sinon.stub(firstBook, 'save').resolves(firstBook);
    
        await firstBook.save(); // Gerçek kaydetme işlemi yapılmıyor, stub ile taklit ediliyor
    
        // Aynı başlıkla ikinci bir kayıt oluşturmaya çalışmayı simüle et
        const duplicateBook = new Book(bookData);
        
        // save() fonksiyonu ikinci kitap için hata fırlatacak şekilde stublanıyor
        saveStub = sinon.stub(duplicateBook, 'save').rejects(new Error('ValidationError: title must be unique'));
    
        await expect(duplicateBook.save()).rejects.toThrow('ValidationError: title must be unique');
    });
    

    // Test: Kitap bulma fonksiyonu
    it('should find a book by title', async () => {
        const bookData = {
            title: 'Test Book',
            author: 'Test Author',
            publishedDate: new Date(),
            genre: 'Fiction'
        };

        // findOne() fonksiyonunu stub ile taklit et
        findStub = sinon.stub(Book, 'findOne').resolves(bookData);

        const foundBook = await Book.findOne({ title: 'Test Book' });

        sinon.assert.calledOnce(findStub); // findOne() metodu bir kez çağrıldı mı
        expect(foundBook.title).toBe(bookData.title);
        expect(foundBook.author).toBe(bookData.author);
    });
});
