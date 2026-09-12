import { Worker } from 'bullmq';
import { createBullMQConnection } from '../config/redis.js';
import { Monitor } from '../models/Monitor.js';
import { MonitorResult } from '../models/MonitorResult.js';
import { emitMonitorStatusChanged } from './socketEmitter.js';
import { logger } from '../config/logger.js';

const CHECK_TIMEOUT_MS = 10000;
const DEGRADED_THRESHOLD_MS = 3000; // meets expected status but is slow

async function checkOneMonitor(monitor) {
  const startedAt = Date.now();
  let statusCode = null;
  let isUp = false;
  let errorMessage = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    const response = await fetch(monitor.url, { method: monitor.method, signal: controller.signal });
    clearTimeout(timeout);

    statusCode = response.status;
    isUp = statusCode === monitor.expectedStatus;
  } catch (err) {
    errorMessage = err.name === 'AbortError' ? 'Request timed out' : err.message;
  }

  const responseTimeMs = Date.now() - startedAt;
  const newStatus = !isUp ? 'down' : responseTimeMs > DEGRADED_THRESHOLD_MS ? 'degraded' : 'up';

  await MonitorResult.create({
    monitor: monitor._id,
    statusCode,
    responseTimeMs,
    isUp,
    errorMessage,
  });

  const statusChanged = monitor.currentStatus !== newStatus;
  monitor.currentStatus = newStatus;
  monitor.nextCheckAt = new Date(Date.now() + monitor.intervalSeconds * 1000);
  await monitor.save();

  if (statusChanged) {
    emitMonitorStatusChanged(monitor.project.toString(), monitor.toSafeObject());
    logger.info(`Monitor "${monitor.name}" changed status to ${newStatus}`);
  }
}

export function createMonitoringWorker() {
  const worker = new Worker(
    'monitoring',
    async () => {
      const dueMonitors = await Monitor.find({ isActive: true, nextCheckAt: { $lte: new Date() } });
      // Settle independently — one slow/broken monitor must not block the others.
      await Promise.allSettled(dueMonitors.map(checkOneMonitor));
      return { checked: dueMonitors.length };
    },
    { connection: createBullMQConnection(), concurrency: 1 }
  );

  worker.on('failed', (job, err) => {
    logger.error(`Monitoring scan job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}
