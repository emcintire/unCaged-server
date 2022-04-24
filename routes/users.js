const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
    User,
    schema,
    loginSchema,
    getIdFromToken,
    updateSchema,
} = require('../models/user');
const { Movie, movieSchema } = require('../models/movie');

router.get('/', async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findById(id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send(user);
});

router.post('/', async (req, res) => {
    //Creates a user with the properties: name, email, password
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered');

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        img: 'https://i.imgur.com/9NYgErP.png',
    });
    const salt = await bcrypt.genSalt(10); //Hash the password
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.send(token);
});

router.put('/', auth, async (req, res) => {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findById(id);
    if (!user) return res.status(400).send('User not found');

    await User.findByIdAndUpdate(id, {
        $set: req.body,
    });

    res.status(200).send();
});

router.put('/changePassword', auth, async (req, res) => {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findById(id);
    if (!user) return res.status(400).send('User not found');

    if (req.body.currentPassword) {
        const validPassword = await bcrypt.compare(
            req.body.currentPassword,
            user.password
        );
        if (!validPassword) return res.status(400).send('Invalid password');
    }

    const salt = await bcrypt.genSalt(10); //Hash the password
    const newPassword = await bcrypt.hash(req.body.password, salt);

    user.password = newPassword;
    await user.save();

    res.status(200).send();
});

router.post('/login', async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password');

    const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
    );
    if (!validPassword)
        return res.status(400).send('Invalid email or password');

    const token = user.generateAuthToken();
    res.send(token);
});

router.delete('/', auth, async (req, res) => {
    //Deletes the user with the given id
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndRemove(id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.get('/favorites', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findById(id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    const movies = [];

    for (const id of user.favorites) {
        let movie = await Movie.findById(id);

        if (!movie)
            return res
                .status(404)
                .send('The movie with the given ID was not found.');

        movies.push(movie);
    }

    res.status(200).send(movies);
});

router.put('/favorites', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $push: {
            favorites: req.body.id,
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.delete('/favorites', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $pull: {
            favorites: req.body.id,
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.get('/unseen', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findById(id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    const unSeen = [];
    const movies = await Movie.find();

    for (const movie of movies) {
        if (!user.seen.includes(movie._id)) {
            unSeen.push(movie);
        }
    }

    res.status(200).send(unSeen);
});

router.get('/seen', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findById(id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    const movies = [];

    for (const id of user.seen) {
        let movie = await Movie.findById(id);

        if (!movie)
            return res
                .status(404)
                .send('The movie with the given ID was not found.');

        movies.push(movie);
    }

    res.status(200).send(movies);
});

router.put('/seen', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $push: {
            seen: req.body.id,
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.delete('/seen', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $pull: {
            seen: req.body.id,
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.get('/watchlist', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findById(id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    const movies = [];

    for (const id of user.watchlist) {
        let movie = await Movie.findById(id);

        if (!movie)
            return res
                .status(404)
                .send('The movie with the given ID was not found.');

        movies.push(movie);
    }

    res.status(200).send(movies);
});

router.put('/watchlist', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $push: {
            watchlist: req.body.id,
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.delete('/watchlist', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $pull: {
            watchlist: req.body.id,
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.get('/rate', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findById(id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    const movies = [];

    for (const rating of user.ratings) {
        let movie = await Movie.findById(rating.movie);

        if (!movie)
            return res
                .status(404)
                .send('The movie with the given ID was not found.');

        movies.push(movie);
    }

    res.status(200).send(movies);
});

router.put('/rate', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $push: {
            ratings: {
                movie: req.body.id,
                rating: req.body.rating,
            },
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    const movie = await Movie.findByIdAndUpdate(req.body.id, {
        $push: {
            ratings: {
                id: id,
                rating: req.body.rating,
            },
        },
    });

    if (!movie)
        return res
            .status(404)
            .send('The movie with the given ID was not found.');

    res.status(200).send();
});

router.delete('/rate', auth, async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $pull: {
            ratings: {
                movie: req.body.id,
            },
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    const movie = await Movie.findByIdAndUpdate(req.body.id, {
        $pull: {
            ratings: {
                id: id,
            },
        },
    });

    if (!movie)
        return res
            .status(404)
            .send('The movie with the given ID was not found.');

    res.status(200).send();
});

router.post('/forgotPassword', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
        return res
            .status(404)
            .send('The user with the given email was not found.');

    const code = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 9)
        .toUpperCase();

    const salt = await bcrypt.genSalt(10); //Hash the code
    user.resetCode = await bcrypt.hash(code, salt);
    await user.save();

    const smtp = nodemailer.createTransport({
        host: 'email-smtp.us-east-2.amazonaws.com',
        port: 587,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    smtp.sendMail({
        from: 'uncaged.app@gmail.com',
        to: req.body.email,
        subject: 'Password Reset',
        html:
            '<p>You are receiving this email in response to a password reset request for your unCaged account.' +
            `<br/> Please paste the following code into the input box on the app: <br/><br/> ${code}<br/><br/>` +
            'If you did not request this please ignore this email. </p>',
    });

    const token = user.generateAuthToken();
    res.send(token);
});

router.post('/checkCode', async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findById(id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given email was not found.');

    const validCode = await bcrypt.compare(req.body.code, user.resetCode);

    if (!validCode) return res.status(400).send('Invalid Code');
    else {
        user.resetCode = '';
        await user.save();
        return res.sendStatus(200);
    }
});

module.exports = router;
