import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { apiRateLimiter } from './middlewares/rateLimiter';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  const allowedOrigins = [
    env.FRONTEND_URL,
    'https://newchef-azure.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev/production with credentials
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // General rate limiter on API
  app.use('/api', apiRateLimiter);

  // Serve uploaded images statically
  app.use(
    '/uploads',
    express.static(env.UPLOAD_PATH, {
      maxAge: '30d',
      immutable: true,
    })
  );

  // Mount API router
  app.use('/api', apiRoutes);

  // Root welcome
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: '👑 مرحباً بكم في خادم مطابخ الشيف فرجاني - Chef Fergany API',
      version: '1.0.0',
      docs: '/api/health',
      frontend: env.FRONTEND_URL,
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'المسار المطلوب غير موجود على الخادم (404)',
      messageEn: 'Resource not found',
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}

export default createApp;
