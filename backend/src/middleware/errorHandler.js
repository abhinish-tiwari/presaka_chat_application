import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'SERVER_ERROR';
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  }

  if (err.code === '23503') {
    statusCode = 400;
    errorCode = 'FOREIGN_KEY_VIOLATION';
    message = 'Referenced resource does not exist';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

