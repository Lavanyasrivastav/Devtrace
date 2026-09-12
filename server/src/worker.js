import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { createAggregationWorker } from './workers/aggregationWorker.js';
import { createMonitoringWorker } from './workers/monitoringWorker.js';
import { monitoringQueue } from './config/queue.js';

const MONITOR_SCAN_INTERVAL_MS = 30000; // check for due monitors every 30s

async function bootstrap() {
  await connectDB();

  const aggregationWorker = createAggregationWorker();
  const monitoringWorker = createMonitoringWorker();

  // Repeatable job: BullMQ dedupes by job name + repeat options, so restarting
  // the worker process does not create duplicate scheduled scans.
  await monitoringQueue.add(
    'scan-due-monitors',
    {},
    { repeat: { every: MONITOR_SCAN_INTERVAL_MS }, jobId: 'monitor-scan-recurring' }
  );

  logger.info('DevTrace worker process started (queues: aggregation, monitoring)');

  const shutdown = async (signal) => {
    logger.info(`${signal} received: shutting down worker gracefully`);
    await Promise.all([aggregationWorker.close(), monitoringWorker.close()]);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error(`Fatal worker startup error: ${err.stack || err.message}`);
  process.exit(1);
});
