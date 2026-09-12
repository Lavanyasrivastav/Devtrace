import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: !env.isProd, // build indexes automatically only in dev; run a migration/build step in prod
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB error: ${err.message}`);
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
