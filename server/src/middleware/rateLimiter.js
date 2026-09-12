import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';

// Rate limiting is a production concern, not something the integration test
// suite should have to work around by spacing out requests or mocking Redis —
// skip enforcement entirely in the test environment.
const skipInTests = () => env.nodeEnv === 'test';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in a minute.',
    errors: [],
  },
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:auth:',
  }),
});

export const ingestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests,
  keyGenerator: (req) => (req.project ? req.project._id.toString() : req.ip),
  message: {
    success: false,
    message: 'Ingestion rate limit exceeded for this project. Please slow down.',
    errors: [],
  },
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:ingest:',
  }),
});
