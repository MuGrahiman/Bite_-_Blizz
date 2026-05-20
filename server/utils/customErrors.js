/**
 * Custom Error Classes
 * Explicit error types for consistent API responses and logging
 */

class CustomError extends Error {
  constructor(message, statusCode, name) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
    this.success = false;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends CustomError {
  constructor(message = "Validation Error") {
    super(message, 400, "ValidationError");
  }
}

class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UnauthorizedError");
  }
}

class ForbiddenError extends CustomError {
  constructor(message = "Forbidden") {
    super(message, 403, "ForbiddenError");
  }
}

class NotFoundError extends CustomError {
  constructor(message = "Not Found") {
    super(message, 404, "NotFoundError");
  }
}

class ConflictError extends CustomError {
  constructor(message = "Conflict Error") {
    super(message, 409, "ConflictError");
  }
}

class BadRequestError extends CustomError {
  constructor(message = "Bad Request") {
    super(message, 400, "BadRequestError");
  }
}

class TimeoutError extends CustomError {
  constructor(message = "Request Timeout") {
    super(message, 408, "TimeoutError");
  }
}

class InternalServerError extends CustomError {
  constructor(message = "Internal Server Error") {
    super(message, 500, "InternalServerError");
  }
}

module.exports = {
  CustomError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  TimeoutError,
  InternalServerError,
};