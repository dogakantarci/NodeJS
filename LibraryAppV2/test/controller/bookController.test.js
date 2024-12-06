const sinon = require('sinon');
const { getAllBooks } = require('../../src/controllers/bookController');
const BookService = require('../../src/services/bookService');
const redisClient = require('../../src/redisClient');
const { InternalServerErrorException } = require('../../src/exceptions/HttpException');
const { HTTPStatusCode } = require('../../src/utils/HttpStatusCode');

describe('getAllBooks Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {};
        mockRes = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        mockNext = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return books from cache if available', async () => {
        const cachedData = JSON.stringify([{ id: 1, title: 'Test Book' }]);

        sinon.stub(redisClient, 'get').resolves(cachedData);

        await getAllBooks(mockReq, mockRes, mockNext);

        sinon.assert.calledWith(redisClient.get, 'allBooks');
        sinon.assert.calledWith(mockRes.status, HTTPStatusCode.Ok);
        sinon.assert.calledWith(mockRes.json, JSON.parse(cachedData));
        sinon.assert.notCalled(mockNext);
    });

    it('should fetch books from database if cache is not available', async () => {
        sinon.stub(redisClient, 'get').resolves(null);
        sinon.stub(BookService, 'getAllBooks').resolves([{ id: 2, title: 'DB Book' }]);
        sinon.stub(redisClient, 'setex').resolves();

        await getAllBooks(mockReq, mockRes, mockNext);

        sinon.assert.calledWith(redisClient.get, 'allBooks');
        sinon.assert.called(BookService.getAllBooks);
        sinon.assert.calledWith(redisClient.setex, 'allBooks', 3600, JSON.stringify([{ id: 2, title: 'DB Book' }]));
        sinon.assert.calledWith(mockRes.status, HTTPStatusCode.Ok);
        sinon.assert.calledWith(mockRes.json, [{ id: 2, title: 'DB Book' }]);
        sinon.assert.notCalled(mockNext);
    });

    it('should handle errors and call next with InternalServerErrorException', async () => {
        const error = new Error('DB Error');
        sinon.stub(redisClient, 'get').throws(error);

        await getAllBooks(mockReq, mockRes, mockNext);

        sinon.assert.calledWith(mockNext, sinon.match.instanceOf(InternalServerErrorException));
        sinon.assert.notCalled(mockRes.json);
    });
});
