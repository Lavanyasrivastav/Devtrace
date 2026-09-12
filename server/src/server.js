import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB } from './config/db.js';
import { redis } from './config/redis.js';
import { initSocket } from './sockets/index.js';

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  initSocket(server);

  server.listen(env.port, () => {
    logger.info(`DevTrace API listening on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received: shutting down gracefully`);
    server.close(async () => {
      await redis.quit();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error(`Fatal startup error: ${err.stack || err.message}`);
  process.exit(1);
});
