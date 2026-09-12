import { logger } from '../config/logger.js';
import { fail } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errors: [],
  });
}

// Must be registered LAST, after all routes.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Known Mongoose/Mongo error shapes we translate into clean client-facing messages.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : 'Duplicate resource';
  }
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  }
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}: ${err.stack || err.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`);
  }

  return fail(res, {
    statusCode,
    message,
    errors,
    ...(!env.isProd && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}
