import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import ingestRoutes from './routes/ingestRoutes.js';
import errorRoutes from './routes/errorRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import monitorRoutes from './routes/monitorRoutes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());

  app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'DevTrace API is healthy', data: {} });
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/ingest', ingestRoutes);
  app.use('/api/errors', errorRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/monitors', monitorRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
