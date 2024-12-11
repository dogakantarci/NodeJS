const sinon = require('sinon');
const { validateBook } = require('../../src/middleware/validationMiddleware');
const Ajv = require('ajv');
const ajvFormats = require('ajv-formats');

// AJV örneği oluşturma
const ajv = new Ajv({ allErrors: true });
ajvFormats(ajv);

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore(); // Her testten sonra stub'ları geri al
  });

  it('should call next() when validation succeeds', async () => {
    // Geçerli bir istek gövdesi ayarlayın
    req.body = {
      title: 'Test Book',
      author: 'Author Name',
      publishedDate: '2023-10-17',
      // Diğer gerekli alanlar...
    };

    await validateBook(req, res, next);

    sinon.assert.calledOnce(next); // next() çağrıldı mı kontrol et
    sinon.assert.notCalled(res.status); // res.status çağrılmadı mı kontrol et
  });

  it('should return 400 if validation fails for empty body', async () => {
    // Boş bir istek gövdesi ayarlayın
    req.body = {};

    await validateBook(req, res, next);

    sinon.assert.calledOnce(res.status); // res.status çağrıldı mı kontrol et
    sinon.assert.calledWith(res.status, 400); // 400 durumu bekleniyor
    sinon.assert.calledOnce(res.json); // res.json çağrıldı mı kontrol et
    sinon.assert.calledWith(res.json, sinon.match({ 
      message: 'Doğrulama hataları mevcut.', 
      errors: sinon.match.array // errors alanı bir dizi olmalı
    }));
    sinon.assert.notCalled(next); // next() çağrılmadı mı kontrol et
  });

  it('should return 400 if validation fails for unexpected additional properties', async () => {
    // Geçersiz bir istek gövdesi ayarlayın
    req.body = {
      title: 'Test Book',
      author: 'Author Name',
      publishedDate: '2023-10-17',
      unexpectedField: 'Unexpected Value', // Beklenmeyen alan
    };

    await validateBook(req, res, next);

    sinon.assert.calledOnce(res.status); // res.status çağrıldı mı kontrol et
    sinon.assert.calledWith(res.status, 400); // 400 durumu bekleniyor
    sinon.assert.calledOnce(res.json); // res.json çağrıldı mı kontrol et
    sinon.assert.calledWith(res.json, sinon.match({ 
      message: 'Doğrulama hataları mevcut.', 
      errors: sinon.match.array // errors alanı bir dizi olmalı
    }));
    sinon.assert.notCalled(next); // next() çağrılmadı mı kontrol et
  });

  it('should return 400 if publishedDate is in an invalid format', async () => {
    // Geçersiz bir tarih formatı ayarlayın
    req.body = {
      title: 'Test Book',
      author: 'Author Name',
      publishedDate: 'invalid-date-format', // Geçersiz tarih
    };

    await validateBook(req, res, next);

    sinon.assert.calledOnce(res.status); // res.status çağrıldı mı kontrol et
    sinon.assert.calledWith(res.status, 400); // 400 durumu bekleniyor
    sinon.assert.calledOnce(res.json); // res.json çağrıldı mı kontrol et
    sinon.assert.calledWith(res.json, sinon.match({ 
      message: 'Doğrulama hataları mevcut.', 
      errors: sinon.match.array // errors alanı bir dizi olmalı
    }));
    sinon.assert.notCalled(next); // next() çağrılmadı mı kontrol et
  });

  // Yeni test 1: title alanı boş bırakıldığında hata
  it('should return 400 if title is empty', async () => {
    // Boş bir title ayarlayın
    req.body = {
      title: '', // Boş title
      author: 'Author Name',
      publishedDate: '2023-10-17',
    };

    await validateBook(req, res, next);

    sinon.assert.calledOnce(res.status); // res.status çağrıldı mı kontrol et
    sinon.assert.calledWith(res.status, 400); // 400 durumu bekleniyor
    sinon.assert.calledOnce(res.json); // res.json çağrıldı mı kontrol et
    sinon.assert.calledWith(res.json, sinon.match({ 
      message: 'Doğrulama hataları mevcut.', 
      errors: sinon.match.array // errors alanı bir dizi olmalı
    }));
    sinon.assert.notCalled(next); // next() çağrılmadı mı kontrol et
  });

  // Yeni test 2: author alanı boş bırakıldığında hata
  it('should return 400 if author is empty', async () => {
    // Boş bir author ayarlayın
    req.body = {
      title: 'Test Book',
      author: '', // Boş author
      publishedDate: '2023-10-17',
    };

    await validateBook(req, res, next);

    sinon.assert.calledOnce(res.status); // res.status çağrıldı mı kontrol et
    sinon.assert.calledWith(res.status, 400); // 400 durumu bekleniyor
    sinon.assert.calledOnce(res.json); // res.json çağrıldı mı kontrol et
    sinon.assert.calledWith(res.json, sinon.match({ 
      message: 'Doğrulama hataları mevcut.', 
      errors: sinon.match.array // errors alanı bir dizi olmalı
    }));
    sinon.assert.notCalled(next); // next() çağrılmadı mı kontrol et
  });
});
