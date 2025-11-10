import express from 'express';
import bodyParser from 'body-parser';
import morganBody from 'morgan-body';
import mongoose from 'mongoose';
import cors from 'cors';
import winston from 'winston';
import 'winston-mongodb';
import 'express-async-errors';
import path from 'path';
import dotenv from 'dotenv';

import { error } from './middleware';
import { movieRouter, userRouter } from './routes';

dotenv.config();

const app = express();

const db = process.env.DB_URL;
if (!db) {
  throw new Error('DB_URL environment variable is not defined');
}

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions)
  .then(() => console.log('Connected to db'))
  .catch((err) => console.error('Database connection error:', err));

winston.add(new winston.transports.File({ filename: 'logfile.log' }));
winston.exceptions.handle(
  new winston.transports.Console({ 
    format: winston.format.simple()
  }),
  new winston.transports.File({ filename: 'uncaughtExceptions.log' })
);
winston.add(
  new winston.transports.MongoDB({
    db: db,
    options: { useUnifiedTopology: true }
  })
);

process.on('unhandledRejection', (ex) => {
  throw ex;
});

app.use(cors());
morganBody(app);
app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/movies', movieRouter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(error);

app.get('/privacy', (_request, response) => {
  response.sendFile(path.join(__dirname, '../public/privacy.html'));
});

app.get('/support', (_request, response) => {
  response.sendFile(path.join(__dirname, '../public/support.html'));
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log('Connected to server'));

export default server;
