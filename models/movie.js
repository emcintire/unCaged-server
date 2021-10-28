const Joi = require('joi');
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    //Mongoose movie schema
    title: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100,
        unique: true,
    },
    director: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100,
    },
    description: {
        type: String,
        maxlength: 512,
    },
    genres: {
        type: [String],
        minlength: 1,
        maxlength: 100,
    },
    runtime: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100,
    },
    rating: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100,
    },
    date: { type: String, minlength: 1, maxlength: 100, required: true },
    img: {
        type: String,
        default: '',
    },
    ratings: [
        {
            id: String,
            rating: Number,
        },
    ],
});

const Movie = mongoose.model('Movie', movieSchema);

const schema = Joi.object({
    //Validates the movie object
    title: Joi.string().min(1).max(100).required(),
    director: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(512),
    date: Joi.string().min(1).max(100).required(),
    runtime: Joi.string().min(1).max(100).required(),
    rating: Joi.string().min(1).max(100).required(),
    img: Joi.string().max(100),
    genres: Joi.array().items(Joi.string()),
});

exports.movieSchema = schema;
exports.Movie = Movie;
