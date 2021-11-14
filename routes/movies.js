const express = require('express');
const router = express.Router();
const { Movie, movieSchema } = require('../models/movie');
const fetch = require('node-fetch');

router.post('/getMovies', async (req, res) => {
    if (req.body.category) {
        const movies = await Movie.find().sort({
            [req.body.category]: req.body.direction,
        });

        res.status(200).send(movies);
    }

    const movies = await Movie.find().sort('director');

    res.status(200).send(movies);
});

router.get('/findByID/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie)
        return res
            .status(404)
            .send('The movie with the given ID was not found.');

    res.status(200).send(movie);
});

router.get('/findByTitle/:title', async (req, res) => {
    const movie = await Movie.find({
        title: { $regex: req.params.title, $options: 'i' },
    });

    res.status(200).send(movie);
});

router.post('/', async (req, res) => {
    //Creates a movie with the properties: title, director, description, date, img
    const { error } = movieSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let movie = await Movie.findOne({ title: req.body.title });
    if (movie) return res.status(400).send('Movie already registered');

    movie = new Movie({
        title: req.body.title,
        director: req.body.director,
        description: req.body.description,
        date: req.body.date,
        rating: req.body.rating,
        runtime: req.body.runtime,
        img: req.body.img,
        genres: req.body.genres,
    });

    await movie.save();

    res.status(200).send();
});

router.put('/:id', async (req, res) => {
    //Updates movie with given id
    const { error } = movieSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let movie = await Movie.findByIdAndUpdate(req.params.id, {
        $set: req.body,
    });

    if (!movie)
        return res
            .status(400)
            .send('The movie with the given ID was not found.');

    res.status(200).send();
});

router.delete('/:id', async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);

    if (!movie)
        return res
            .status(404)
            .send('The movie with the given ID was not found.');

    res.status(200).send();
});

router.get('/avgRating/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie)
        return res
            .status(404)
            .send('The movie with the given ID was not found.');

    const ratings = [];

    for (const rating of movie.ratings) {
        ratings.push(rating.rating);
    }

    if (ratings.length === 0) {
        res.status(200).send('0');
    } else {
        let avg = ratings.reduce((a, b) => a + b) / ratings.length;
        avg = Math.round(avg * 10) / 10;

        res.status(200).send(JSON.stringify(avg));
    }
});

router.get('/sortByRating', async (req, res) => {
    const movies = await Movie.find();

    for (const movie of movies) {
        let response = await fetch(
            'https://uncaged-server.herokuapp.com/api/movies/avgRating/' +
                movie._id,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );
        const body = await response.text();
        movie.avgRating = body;

        await movie.save();
    }

    res.sendStatus(200);
});

router.get('/quote', async (req, res) => {
    const quote = '"I never disrobe before gunplay."';
    const subquote = "-John Miltion, 'Drive Angry'";

    const initialDate = new Date(2021, 11, 7);
    const now = new Date();
    const difference = now - initialDate;
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysSince = Math.floor(difference / millisecondsPerDay);

    const obj = { quote, subquote };

    res.status(200).send(obj);
});

module.exports = router;
