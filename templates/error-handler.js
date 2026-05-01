/**
 * Error Handler Middleware & Utilities
 * ============================================================================
 * Centralized error handling for consistent error responses across the API
 * 
 * Purpose:
 * - Custom error classes for different error types
 * - Express middleware for error handling
 * - Consistent error response formatting
 * - Logging integration
 * 
 * Usage:
 * ```javascript
 * import { AppError, asyncHandler } from './error-handler.js';
 * 
 * // Throw custom errors
 * throw new ValidationError('Invalid input', { field: 'email' });
 * throw new NotFoundError('User not found');
 * throw new UnauthorizedError('Invalid credentials');
 * throw new ForbiddenError('Access denied');
 * 
 * // Wrap async routes
 * router.get('/users/:id', asyncHandler(async (req, res) => {
 *   const user = await getUserById(req.params.id);
 *   res.json(user);
 * }));
 * ```
 */

import { logger } from './logger.js';

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        statusCode: this.statusCode,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, details);
    this.name = 'BadRequestError';
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends AppError {
  constructor(message, errors = {}) {
    super(message, 422, { errors });
    this.name = 'ValidationError';
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = {}) {
    super(message, 401, details);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied', details = {}) {
    super(message, 403, details);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = {}) {
    super(message, 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message, details = {}) {
    super(message, 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Lex Service Error (503)
 */
export class LexServiceError extends AppError {
  constructor(message = 'Lex service error', details = {}) {
    super(message, 503, details);
    this.name = 'LexServiceError';
  }
}

/**
 * AWS Service Error (503)
 */
export class AWSServiceError extends AppError {
  constructor(message = 'AWS service error', details = {}) {
    super(message, 503, details);
    this.name = 'AWSServiceError';
  }
}

/**
 * Wrap async route handlers to catch errors
 * @param {Function} fn - Async handler function
 * @returns {Function} Express middleware
 */
export const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Express error handling middleware
 * Should be placed AFTER all other middleware and route handlers
 * 
 * Usage:
 * ```javascript
 * app.use(errorHandler);
 * ```
 */
export const errorHandler = (err, req, res, next) => {
  // Default error response
  let error = err;

  // Handle specific AWS SDK errors
  if (err.name === 'ServiceUnavailableException' || err.name === 'ThrottlingException') {
    error = new LexServiceError(err.message, { originalError: err.name });
  }

  // Handle validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    const errors = err.array().reduce((acc, e) => {
      acc[e.param] = e.msg;
      return acc;
    }, {});
    error = new ValidationError('Validation failed', errors);
  }

  // Convert unknown errors to AppError
  if (!(error instanceof AppError)) {
    error = new AppError(
      err.message || 'Internal server error',
      err.statusCode || 500,
      { originalError: err.name }
    );
  }

  // Log error
  const logContext = {
    method: req.method,
    path: req.path,
    statusCode: error.statusCode,
    errorName: error.name,
    errorMessage: error.message,
    userId: req.user?.id || 'anonymous',
    requestId: req.id
  };

  if (error.statusCode >= 500) {
    logger.error('Server error', { ...logContext, stack: err.stack });
  } else if (error.statusCode >= 400) {
    logger.warn('Client error', logContext);
  }

  // Send error response
  res.status(error.statusCode).json(error.toJSON());
};

/**
 * Create a validation result handler middleware
 * Usage in routes:
 * ```javascript
 * router.post('/login', 
 *   body('email').isEmail(),
 *   body('password').isLength({ min: 6 }),
 *   validateResults,
 *   loginHandler
 * );
 * ```
 */
export const validateResults = (req, res, next) => {
  const errors = {};
  
  // Collect all validation errors
  for (const error of req.validationErrors?.() || []) {
    if (!errors[error.param]) {
      errors[error.param] = [];
    }
    errors[error.param].push(error.msg);
  }

  if (Object.keys(errors).length > 0) {
    return next(new ValidationError('Validation failed', errors));
  }

  next();
};
