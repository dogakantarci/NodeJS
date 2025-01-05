"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayTimeoutException = exports.ServiceUnavailableException = exports.BadGatewayException = exports.NotImplementedException = exports.InternalServerErrorException = exports.TooManyRequestsException = exports.UnprocessableEntityException = exports.GoneException = exports.ConflictException = exports.RequestTimeoutException = exports.MethodNotAllowedException = exports.NotFoundException = exports.ForbiddenException = exports.PaymentRequiredException = exports.UnauthorizedException = exports.BadRequestException = exports.FoundException = exports.MovedPermanentlyException = exports.MultipleChoicesException = exports.PartialContentException = exports.NoContentException = exports.AcceptedException = exports.CreatedException = exports.OkException = exports.HttpException = void 0;
// src/exceptions/HttpException.ts
const HttpStatusCode_1 = require("../utils/HttpStatusCode");
class HttpException extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "HttpException";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.HttpException = HttpException;
class OkException extends HttpException {
    constructor(message = "OK") {
        super(HttpStatusCode_1.HTTPStatusCode.Ok, message);
    }
}
exports.OkException = OkException;
class CreatedException extends HttpException {
    constructor(message = "Created") {
        super(HttpStatusCode_1.HTTPStatusCode.Created, message);
    }
}
exports.CreatedException = CreatedException;
class AcceptedException extends HttpException {
    constructor(message = "Accepted") {
        super(HttpStatusCode_1.HTTPStatusCode.Accepted, message);
    }
}
exports.AcceptedException = AcceptedException;
class NoContentException extends HttpException {
    constructor(message = "No Content") {
        super(HttpStatusCode_1.HTTPStatusCode.NoContent, message);
    }
}
exports.NoContentException = NoContentException;
class PartialContentException extends HttpException {
    constructor(message = "Partial Content") {
        super(HttpStatusCode_1.HTTPStatusCode.PartialContent, message);
    }
}
exports.PartialContentException = PartialContentException;
class MultipleChoicesException extends HttpException {
    constructor(message = "Multiple Choices") {
        super(HttpStatusCode_1.HTTPStatusCode.MultipleChoices, message);
    }
}
exports.MultipleChoicesException = MultipleChoicesException;
class MovedPermanentlyException extends HttpException {
    constructor(message = "Moved Permanently") {
        super(HttpStatusCode_1.HTTPStatusCode.MovedPermanently, message);
    }
}
exports.MovedPermanentlyException = MovedPermanentlyException;
class FoundException extends HttpException {
    constructor(message = "Found") {
        super(HttpStatusCode_1.HTTPStatusCode.Found, message);
    }
}
exports.FoundException = FoundException;
class BadRequestException extends HttpException {
    constructor(message = "Bad Request") {
        super(HttpStatusCode_1.HTTPStatusCode.BadRequest, message);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends HttpException {
    constructor(message = "Unauthorized") {
        super(HttpStatusCode_1.HTTPStatusCode.Unauthorized, message);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class PaymentRequiredException extends HttpException {
    constructor(message = "Payment Required") {
        super(HttpStatusCode_1.HTTPStatusCode.PaymentRequired, message);
    }
}
exports.PaymentRequiredException = PaymentRequiredException;
class ForbiddenException extends HttpException {
    constructor(message = "Forbidden") {
        super(HttpStatusCode_1.HTTPStatusCode.Forbidden, message);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundException extends HttpException {
    constructor(message = "Not Found") {
        super(HttpStatusCode_1.HTTPStatusCode.NotFound, message);
    }
}
exports.NotFoundException = NotFoundException;
class MethodNotAllowedException extends HttpException {
    constructor(message = "Method Not Allowed") {
        super(HttpStatusCode_1.HTTPStatusCode.MethodNotAllowed, message);
    }
}
exports.MethodNotAllowedException = MethodNotAllowedException;
class RequestTimeoutException extends HttpException {
    constructor(message = "Request Timeout") {
        super(HttpStatusCode_1.HTTPStatusCode.RequestTimeout, message);
    }
}
exports.RequestTimeoutException = RequestTimeoutException;
class ConflictException extends HttpException {
    constructor(message = "Conflict") {
        super(HttpStatusCode_1.HTTPStatusCode.Conflict, message);
    }
}
exports.ConflictException = ConflictException;
class GoneException extends HttpException {
    constructor(message = "Gone") {
        super(HttpStatusCode_1.HTTPStatusCode.Gone, message);
    }
}
exports.GoneException = GoneException;
class UnprocessableEntityException extends HttpException {
    constructor(message = "Unprocessable Entity") {
        super(HttpStatusCode_1.HTTPStatusCode.UnprocessableEntity, message);
    }
}
exports.UnprocessableEntityException = UnprocessableEntityException;
class TooManyRequestsException extends HttpException {
    constructor(message = "Too Many Requests") {
        super(HttpStatusCode_1.HTTPStatusCode.TooManyRequests, message);
    }
}
exports.TooManyRequestsException = TooManyRequestsException;
class InternalServerErrorException extends HttpException {
    constructor(message = "Internal Server Error") {
        super(HttpStatusCode_1.HTTPStatusCode.InternalServerError, message);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
class NotImplementedException extends HttpException {
    constructor(message = "Not Implemented") {
        super(HttpStatusCode_1.HTTPStatusCode.NotImplemented, message);
    }
}
exports.NotImplementedException = NotImplementedException;
class BadGatewayException extends HttpException {
    constructor(message = "Bad Gateway") {
        super(HttpStatusCode_1.HTTPStatusCode.BadGateway, message);
    }
}
exports.BadGatewayException = BadGatewayException;
class ServiceUnavailableException extends HttpException {
    constructor(message = "Service Unavailable") {
        super(HttpStatusCode_1.HTTPStatusCode.ServiceUnavailable, message);
    }
}
exports.ServiceUnavailableException = ServiceUnavailableException;
class GatewayTimeoutException extends HttpException {
    constructor(message = "Gateway Timeout") {
        super(HttpStatusCode_1.HTTPStatusCode.GatewayTimeout, message);
    }
}
exports.GatewayTimeoutException = GatewayTimeoutException;
