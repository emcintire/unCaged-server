import type { Express } from 'express';
import path from 'path';
import { movieRouter } from '@/movies';
import { userRouter } from '@/users';

export function setupRoutes(app: Express) {
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/users', userRouter);
  app.use('/api/movies', movieRouter);

  app.get('/privacy', (_request, response) => {
    response.sendFile(path.join(__dirname, '../public/privacy.html'));
  });

  app.get('/support', (_request, response) => {
    response.sendFile(path.join(__dirname, '../public/support.html'));
  });
}
