/**
 * Logger Utility
 * ============================================================================
 * Centralized logging service using Winston
 * 
 * Features:
 * - Structured logging with context
 * - Environment-based log levels
 * - Console and file outputs
 * - Request ID tracking
 * - Error stack traces
 * 
 * Usage:
 * ```javascript
 * import { logger } from './logger.js';
 * 
 * logger.info('User logged in', { userId: 123, email: 'user@example.com' });
 * logger.error('Database connection failed', { error: err.message, stack: err.stack });
 * logger.debug('Cache hit', { key: 'user:123' });
 * logger.warn('High memory usage', { memoryMB: 1024 });
 * ```
 */

import winston from 'winston';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Custom format for readable console output
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}] ${message} ${metaStr}`;
  })
);

/**
 * JSON format for file/structured logging
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Winston logger instance
 */
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: jsonFormat,
  defaultMeta: { service: 'lex-web-ui' },
  transports: [
    // Console transport with readable format
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Add file transport in production
if (NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760,
      maxFiles: 5
    })
  );
}

/**
 * Create a request logger middleware for Express
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request details
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration
    });
  });

  next();
};

export { logger };
