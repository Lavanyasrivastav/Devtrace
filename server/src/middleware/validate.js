import { ValidationError } from '../utils/AppError.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message);
      return next(new ValidationError('Validation failed', messages));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message);
      return next(new ValidationError('Invalid query parameters', messages));
    }
    // req.query is a getter-only object in some Express/Node versions, so we
    // attach the parsed+coerced result separately rather than reassigning it.
    req.validatedQuery = result.data;
    next();
  };
}
