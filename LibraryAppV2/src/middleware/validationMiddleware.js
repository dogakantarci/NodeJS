// src/middleware/validationMiddleware.js
const Ajv = require('ajv');
const ajvFormats = require('ajv-formats');
const bookSchema = require('../schemas/bookSchema.json');
const { addLog } = require('../services/elasticsearchService');

// AJV örneği oluşturma
const ajv = new Ajv({ allErrors: true }); //
ajvFormats(ajv);  // Tarih ve diğer formatlar için `ajv-formats` ekliyoruz

// AJV doğrulama middleware'i
const validateBook = async (req, res, next) => {
  console.log('Gelen istek gövdesi:', req.body); // İstek gövdesini konsola yazdır
  const validate = ajv.compile(bookSchema);
  const valid = validate(req.body);

  if (!valid) {
    console.log('Doğrulama hataları:', validate.errors); // Hataları konsola yazdır
    const formattedErrors = validate.errors.map(error => {
      let field = error.instancePath.substring(1) || "Bilinmeyen alan"; // /author olarak döndürdüğünden ilk karakteri çıkarıyoruz
      if (error.keyword === 'required') {
        field = error.params.missingProperty;
      } else if (error.keyword === 'additionalProperties') {
        field = "Bilinmeyen alan";
      }
      return {
        field: field,
        message: error.message
      };
    });

    await addLog({
      level: 'error',
      message: 'Doğrulama hatası',
      errors: formattedErrors,
      requestBody: req.body,
    });

    return res.status(400).json({ 
      errors: formattedErrors, 
      message: 'Doğrulama hataları mevcut.' 
    });
  }

  next();
};


module.exports = { validateBook };