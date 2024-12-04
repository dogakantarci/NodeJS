// src/exceptions/HttpException.ts
import { HTTPStatusCode } from "../utils/HttpStatusCode";

export class HttpException extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpException";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class OkException extends HttpException {
  constructor(message = "OK") {
    super(HTTPStatusCode.Ok, message);
  }
}

export class CreatedException extends HttpException {
  constructor(message = "Created") {
    super(HTTPStatusCode.Created, message);
  }
}

export class AcceptedException extends HttpException {
  constructor(message = "Accepted") {
    super(HTTPStatusCode.Accepted, message);
  }
}

export class NoContentException extends HttpException {
  constructor(message = "No Content") {
    super(HTTPStatusCode.NoContent, message);
  }
}

export class PartialContentException extends HttpException {
  constructor(message = "Partial Content") {
    super(HTTPStatusCode.PartialContent, message);
  }
}

export class MultipleChoicesException extends HttpException {
  constructor(message = "Multiple Choices") {
    super(HTTPStatusCode.MultipleChoices, message);
  }
}

export class MovedPermanentlyException extends HttpException {
  constructor(message = "Moved Permanently") {
    super(HTTPStatusCode.MovedPermanently, message);
  }
}

export class FoundException extends HttpException {
  constructor(message = "Found") {
    super(HTTPStatusCode.Found, message);
  }
}

export class BadRequestException extends HttpException {
  constructor(message = "Bad Request") {
    super(HTTPStatusCode.BadRequest, message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized") {
    super(HTTPStatusCode.Unauthorized, message);
  }
}

export class PaymentRequiredException extends HttpException {
  constructor(message = "Payment Required") {
    super(HTTPStatusCode.PaymentRequired, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "Forbidden") {
    super(HTTPStatusCode.Forbidden, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Not Found") {
    super(HTTPStatusCode.NotFound, message);
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(message = "Method Not Allowed") {
    super(HTTPStatusCode.MethodNotAllowed, message);
  }
}

export class RequestTimeoutException extends HttpException {
  constructor(message = "Request Timeout") {
    super(HTTPStatusCode.RequestTimeout, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Conflict") {
    super(HTTPStatusCode.Conflict, message);
  }
}

export class GoneException extends HttpException {
  constructor(message = "Gone") {
    super(HTTPStatusCode.Gone, message);
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(message = "Unprocessable Entity") {
    super(HTTPStatusCode.UnprocessableEntity, message);
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message = "Too Many Requests") {
    super(HTTPStatusCode.TooManyRequests, message);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message = "Internal Server Error") {
    super(HTTPStatusCode.InternalServerError, message);
  }
}

export class NotImplementedException extends HttpException {
  constructor(message = "Not Implemented") {
    super(HTTPStatusCode.NotImplemented, message);
  }
}

export class BadGatewayException extends HttpException {
  constructor(message = "Bad Gateway") {
    super(HTTPStatusCode.BadGateway, message);
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message = "Service Unavailable") {
    super(HTTPStatusCode.ServiceUnavailable, message);
  }
}

export class GatewayTimeoutException extends HttpException {
  constructor(message = "Gateway Timeout") {
    super(HTTPStatusCode.GatewayTimeout, message);
  }
}