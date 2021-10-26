const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
// const async = require('../middleware/async');
// const validateObjectId = require('../middleware/validateObjectId');
const { User, schema, loginSchema, getIdFromToken } = require('../models/user');

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send(user);
});

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

router.post('/login', async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
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

router.put('/favorite', async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $push: {
            favorites: req.body.movie,
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.put('/seen', async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $push: {
            seen: req.body.movie,
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.put('/watchlist', async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $push: {
            watchlist: req.body.movie,
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.put('/removeFromSeen', async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $pull: {
            seen: { title: req.body.movie.title },
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.put('/removeFromFavorites', async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $pull: {
            favorites: { title: req.body.movie.title },
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

router.put('/removeFromWatchlist', async (req, res) => {
    const id = getIdFromToken(req.header('x-auth-token'));
    const user = await User.findByIdAndUpdate(id, {
        $pull: {
            watchlist: { title: req.body.movie.title },
        },
    });

    if (!user)
        return res
            .status(404)
            .send('The user with the given ID was not found.');

    res.status(200).send();
});

// router.put('/updateProfile', auth, async (req, res) => {
//     const { error } = updateSchema.validate(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     const id = getIdFromToken(req.header('x-auth-token'));

//     let user = await User.findByIdAndUpdate(id, {
//         $set: _.omit(req.body, req.body.address),
//     });

//     if (req.body.address) {
//         //Updates the location of the logged in user
//         const options = {
//             provider: 'mapquest',
//             httpAdapter: 'https',
//             apiKey: 'HEEOmggzJMuZBvhQTMzHg5NzjAeBaIvo',
//         };

//         //Converts address string to coordinates
//         const geocoder = nodegeocoder(options);
//         const result = await geocoder.geocode(req.body.address, function (err) {
//             if (err) {
//                 res.send(err);
//             }
//         });
//         const coords = [result[0].longitude, result[0].latitude];

//         user = await User.findByIdAndUpdate(id, {
//             location: {
//                 type: 'Point',
//                 address: result[0].formattedAddress,
//                 coordinates: coords,
//                 index: '2d',
//             },
//         });
//     }

//     if (!user)
//         return res
//             .status(404)
//             .send('The user with the given ID was not found.');

//     res.status(200).send();
// });

// router.put('/updateAccount', auth, async (req, res) => {
//     // const { error } = updateSchema.validate(req.body);
//     // if (error) return res.status(400).send(error.details[0].message);

//     const id = getIdFromToken(req.header('x-auth-token'));
//     let user = await User.findById(id);

//     if (req.body.oldPassword) {
//         const validPassword = await bcrypt.compare(
//             req.body.oldPassword,
//             user.password
//         );
//         if (!validPassword)
//             return res.status(400).send('Invalid email or password');

//         //Hashes the users password for security
//         const salt = await bcrypt.genSalt(10);
//         const newPassword = await bcrypt.hash(req.body.newPassword, salt);

//         user = await User.findByIdAndUpdate(
//             id,
//             {
//                 email: req.body.email,
//                 password: newPassword,
//             },
//             {
//                 new: true,
//             }
//         );
//     } else {
//         user = await User.findByIdAndUpdate(
//             id,
//             {
//                 email: req.body.email,
//             },
//             {
//                 new: true,
//             }
//         );
//     }

//     if (!user)
//         return res
//             .status(404)
//             .send('The user with the given ID was not found.');

//     res.status(200).send();
// });

module.exports = router;
