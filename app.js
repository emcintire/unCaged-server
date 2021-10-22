const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morganBody = require('morgan-body');
const mongoose = require('mongoose');
const Joi = require('joi');
const config = require('config');
const cors = require('cors');

const users = require('./routes/users');

Joi.objectId = require('joi-objectid')(Joi);

const db = config.get('db');
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log(`Connected to ${db}...`));

app.use(cors());
app.use(express.json());
app.use('/api/users', users);
// app.use('/api/auth', auth);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.env.PORT || 5000;
const server = app.listen(port, () =>
    console.log(`Listening on port ${port}...`)
);

module.exports = server;
