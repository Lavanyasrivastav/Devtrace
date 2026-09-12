import { Queue } from 'bullmq';
import { createBullMQConnection } from './redis.js';

export const aggregationQueue = new Queue('aggregation', {
  connection: createBullMQConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const monitoringQueue = new Queue('monitoring', {
  connection: createBullMQConnection(),
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 20,
    removeOnFail: 50,
  },
});
