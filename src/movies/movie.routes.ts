import express from 'express';
import { auth, admin } from '@/middleware';
import { MovieController } from './movie.controller';

export const movieRouter = express.Router();
const controller = new MovieController();

// Movie routes
movieRouter.get('/', controller.getAllMovies.bind(controller));
movieRouter.post('/getMovies', controller.getMoviesWithSort.bind(controller));
movieRouter.get('/findByID/:id', controller.findMovieById.bind(controller));
movieRouter.get('/findByTitle/:title', controller.findMoviesByTitleParam.bind(controller));
movieRouter.post('/findByTitle', controller.findMoviesByTitle.bind(controller));

// Admin movie management
movieRouter.post('/', auth, admin, controller.createMovie.bind(controller));
movieRouter.put('/:id', auth, admin, controller.updateMovie.bind(controller));

// Rating routes
movieRouter.get('/avgRating/:id', controller.getAverageRating.bind(controller));
movieRouter.get('/updateRatings', controller.updateAllRatings.bind(controller));
movieRouter.put('/updateRating/:id', controller.updateMovieRating.bind(controller));

// Quote routes
movieRouter.get('/quote', controller.getQuote.bind(controller));
movieRouter.post('/quote', auth, admin, controller.createQuote.bind(controller));
