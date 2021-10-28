const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morganBody = require('morgan-body');
const mongoose = require('mongoose');
const Joi = require('joi');
const cors = require('cors');
const winston = require('winston');
const error = require('./middleware/error');
require('express-async-errors');
Joi.objectId = require('joi-objectid')(Joi);

const users = require('./routes/users');
const movies = require('./routes/movies');

const db = process.env.DB_URL;

mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log(`Connected to db`));

winston.add(new winston.transports.File({ filename: 'logfile.log' }));
winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: 'uncaughtExceptions.log' })
);

process.on('unhandledRejection', (ex) => {
    throw ex;
});

app.use(cors());
morganBody(app);
app.use(express.json());
app.use('/api/users', users);
app.use('/api/movies', movies);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(error);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => console.log(`Connected to server`));

module.exports = server;
