import express from 'express';
import cors from 'cors';
import type { Express } from 'express';
import rateLimit from 'express-rate-limit';
import { error } from '@/middleware';
import { setupRoutes } from './routes';

export function createApp(): Express {
  const app = express();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(limiter);
  setupRoutes(app);
  app.use(error);

  return app;
}
