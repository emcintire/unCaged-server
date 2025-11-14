import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import winston from 'winston';
import 'winston-mongodb';
import path from 'path';
import dotenv from 'dotenv';

import { error } from './middleware';
import { movieRouter } from './movies';
import { userRouter } from './users';

dotenv.config();

const app = express();

const db = process.env.DB_URL;
if (!db) {
  throw new Error('DB_URL environment variable is not defined');
}

mongoose.set('strictQuery', false);

// Only connect if not in test environment (tests handle their own connection)
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(db)
    .then(() => console.log('Connected to db'))
    .catch((err) => console.error('Database connection error:', err));
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.MongoDB({ db, level: 'error' })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'exceptions.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

process.on('unhandledRejection', (ex) => {
  throw ex;
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/users', userRouter);
app.use('/api/movies', movieRouter);
app.use(error);

app.get('/privacy', (_request, response) => {
  response.sendFile(path.join(__dirname, '../public/privacy.html'));
});

app.get('/support', (_request, response) => {
  response.sendFile(path.join(__dirname, '../public/support.html'));
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log('Connected to server'));
}

export default app;
