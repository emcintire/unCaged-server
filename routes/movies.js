const express = require('express');
const router = express.Router();
const { Movie, movieSchema } = require('../models/movie');

router.get('/', async (req, res) => {
    const movies = await Movie.find();

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

router.get('/:genre', async (req, res) => {
    const movies = await Movie.find({ genres: req.params.genre });

    if (!movies)
        return res.status(404).send('There are no movies with that genre.');

    res.status(200).send(movies);
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

module.exports = router;
