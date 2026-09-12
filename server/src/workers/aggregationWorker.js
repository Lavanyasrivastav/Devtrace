import { Worker } from 'bullmq';
import { createBullMQConnection } from '../config/redis.js';
import { ErrorGroup } from '../models/ErrorGroup.js';
import { ErrorOccurrence } from '../models/ErrorOccurrence.js';
import { detectSpike } from '../services/recurringDetection.js';
import { logger } from '../config/logger.js';

const WINDOW_MINUTES = 60;
const SPIKE_THRESHOLD = 10; // 10+ occurrences within the window counts as a spike

export function createAggregationWorker() {
  const worker = new Worker(
    'aggregation',
    async (job) => {
      const { errorGroupId } = job.data;

      const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
      const recentCount = await ErrorOccurrence.countDocuments({
        errorGroup: errorGroupId,
        timestamp: { $gte: windowStart },
      });

      const { isSpike, rate } = detectSpike(recentCount, WINDOW_MINUTES, SPIKE_THRESHOLD);

      await ErrorGroup.findByIdAndUpdate(errorGroupId, {
        trend: { isSpike, rate },
        lastDetectionAt: new Date(),
      });

      return { errorGroupId, isSpike, rate };
    },
    { connection: createBullMQConnection(), concurrency: 5 }
  );

  worker.on('completed', (job, result) => {
    if (result.isSpike) {
      logger.warn(`Spike detected: error group ${result.errorGroupId} at ${result.rate}/hr`);
    }
  });

  worker.on('failed', (job, err) => {
    logger.error(`Aggregation job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}
