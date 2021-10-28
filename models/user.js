const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    //Mongoose user schema
    isAdmin: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024,
    },
    img: {
        type: String,
        default: '',
    },
    ratings: [
        {
            movie: String,
            rating: Number,
        },
    ],
    watchlist: [String],
    favorites: [String],
    seen: [String],
});

userSchema.methods.generateAuthToken = function () {
    //Generates a json web token used for logging in users
    return jwt.sign(
        { _id: this._id, isAdmin: this.isAdmin },
        process.env.JWT_PRIVATE_KEY
    );
};

const User = mongoose.model('User', userSchema);

const schema = Joi.object({
    //Validates the user object when the user is first created
    name: Joi.string().min(1).max(100).required(),
    email: Joi.string().min(1).max(100).required().email(),
    password: Joi.string()
        .pattern(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/
        )
        .required(),
});

const loginSchema = Joi.object({
    email: Joi.string().min(1).max(100).required().email(),
    password: Joi.string()
        .pattern(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/
        )
        .required(),
});

const updateSchema = Joi.object({
    name: Joi.string().min(1).max(100),
    email: Joi.string().email().min(1).max(100),
    id: Joi.string().min(1).max(100),
    img: Joi.string().min(1).max(100),
    password: Joi.string().pattern(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/
    ),
});

const getIdFromToken = function (token) {
    //Decodes the json web token and returns the users id
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    return decoded._id;
};

Array.prototype.remove_by_value = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

exports.remove_by_value = this.remove_by_value;
exports.getIdFromToken = getIdFromToken;
exports.schema = schema;
exports.loginSchema = loginSchema;
exports.updateSchema = updateSchema;
exports.User = User;
