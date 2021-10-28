const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
    User,
    schema,
    loginSchema,
    getIdFromToken,
    updateSchema,
} = require('../models/user');
const { Movie } = require('../models/movie');

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
        img: 'https://i.imgur.com/9NYgErPm.png',
    });
    const salt = await bcrypt.genSalt(10); //Hash the password
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.send(token);
});

router.put('/', async (req, res) => {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findById(id);
    if (!user) return res.status(400).send('User not found');

    if (req.body.password) {
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword)
            return res.status(400).send('Invalid email or password');
    }

    await findByIdAndUpdate(id, {
        $set: req.body,
    });

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

router.delete('/', admin, async (req, res) => {
    //Deletes the user with the given id
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndRemove(id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
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

    res.status(200).send();
});

router.put('/removeFromSeen', auth, async (req, res) => {
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

router.put('/removeFromFavorites', auth, async (req, res) => {
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

router.put('/removeFromWatchlist', auth, async (req, res) => {
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

router.put('/removeRating', auth, async (req, res) => {
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

    res.status(200).send();
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
        let m = await Movie.findById(id);

        if (!m)
            return res
                .status(404)
                .send('The movie with the given ID was not found.');

        movies.push(m);
    }

    res.status(200).send(movies);
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
        let m = await Movie.findById(id);

        if (!m)
            return res
                .status(404)
                .send('The movie with the given ID was not found.');

        movies.push(m);
    }

    res.status(200).send(movies);
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
        let m = await Movie.findById(id);

        if (!m)
            return res
                .status(404)
                .send('The movie with the given ID was not found.');

        movies.push(m);
    }

    res.status(200).send(movies);
});

module.exports = router;
