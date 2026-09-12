import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

// BullMQ requires maxRetriesPerRequest: null on the connection it uses.
// We keep one shared connection for general cache use, and export a factory
// for BullMQ so each queue/worker gets a connection with the right options.
export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error(`Redis error: ${err.message}`));

export function createBullMQConnection() {
  return new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
  });
}
