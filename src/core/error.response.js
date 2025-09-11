"use strict";

// Gộp các hằng số lại để dễ quản lý và tránh nhầm lẫn
const HttpStatusCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

// Các Reason Phrase chuẩn của HTTP
const ReasonPhrases = {
  BAD_REQUEST: "Bad Request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not Found",
  CONFLICT: "Conflict",
};

// Class cha cho các lỗi nghiệp vụ
class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Các class lỗi cụ thể, kế thừa từ ErrorResponse

class ConflictRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.CONFLICT,
    statusCode = HttpStatusCode.CONFLICT
  ) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.BAD_REQUEST,
    statusCode = HttpStatusCode.BAD_REQUEST
  ) {
    super(message, statusCode);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.FORBIDDEN,
    statusCode = HttpStatusCode.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.NOT_FOUND,
    statusCode = HttpStatusCode.NOT_FOUND
  ) {
    super(message, statusCode);
  }
}

// ... bạn có thể thêm các class lỗi khác như UnauthorizedError ...

module.exports = {
  ErrorResponse, // <-- Export class cha để dùng cho `instanceof`
  ConflictRequestError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
};
