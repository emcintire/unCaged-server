const Joi = require('joi');
const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    quote: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
    },
    subquote: {
        type: String,
        required: false,
        minlength: 1,
        maxlength: 128,
    },
    createdOn: {
        type: Date,
        default: new Date(),
    }
});

const Quote = mongoose.model('Quote', quoteSchema);

const schema = Joi.object({
    quote: Joi.string().min(1).max(255),
    subquote: Joi.string().min(1).max(128).required(),
});

exports.quoteSchema = schema;
exports.Quote = Quote;
