import express, { type Request, type Response } from 'express';
import { Movie, Quote } from '../models';
import { admin, auth } from '../middleware';
import { movieSchema, quoteSchema } from '../schemas';
import type { AuthRequest } from '../types';
import { quotes } from '../util';

export const movieRouter = express.Router();

movieRouter.get('/', async (_req: Request, res: Response) => {
  const movies = await Movie.find().sort('director');
  res.status(200).send(movies);
});

movieRouter.post('/getMovies', async (req: Request, res: Response) => {
  if (req.body.category) {
    const movies = await Movie.find().sort({
      [req.body.category]: req.body.direction,
    });
    return res.status(200).send(movies);
  }

  const movies = await Movie.find().sort('director');
  res.status(200).send(movies);
});

movieRouter.get('/findByID/:id', async (req: Request, res: Response) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie)
    return res
      .status(404)
      .send('The movie with the given ID was not found.');

  res.status(200).send(movie);
});

movieRouter.post('/findByTitle', async (req: Request, res: Response) => {
  if (req.body.title) {
    const movies = await Movie.find({
      title: { $regex: req.body.title, $options: 'i' },
    }).sort({
      [req.body.category]: req.body.direction,
    });
    return res.status(200).send(movies);
  } else {
    const movies = await Movie.find().sort({
      [req.body.category]: req.body.direction,
    });
    return res.status(200).send(movies);
  }
});

movieRouter.get('/findByTitle/:title', async (req: Request, res: Response) => {
  const movie = await Movie.find({
    title: { $regex: req.params.title, $options: 'i' },
  });

  res.status(200).send(movie);
});

movieRouter.post('/', [auth, admin], async (req: AuthRequest, res: Response) => {
  const validation = movieSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).send(validation.error.issues[0].message);
  }

  const movieAlreadyExists = await Movie.findOne({ title: req.body.title }) != null;
  if (movieAlreadyExists) {
    return res.status(400).send('Movie already registered');
  }

  const movie = new Movie({
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
  res.sendStatus(200);
});

movieRouter.put('/:id', [auth, admin], async (req: AuthRequest, res: Response) => {
  const validation = movieSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).send(validation.error.issues[0].message);
  }

  const movie = await Movie.findByIdAndUpdate(req.params.id, { $set: req.body });

  if (!movie)
    return res
      .status(400)
      .send('The movie with the given ID was not found.');

  res.sendStatus(200);
});

movieRouter.get('/avgRating/:id', async (req: Request, res: Response) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie)
    return res
      .status(404)
      .send('The movie with the given ID was not found.');

  const ratings = movie.ratings.map((rating) => rating.rating);

  if (ratings.length === 0) {
    res.status(200).send('0');
  } else {
    const avg = Math.round(ratings.reduce((a, b) => a + b) / ratings.length * 10) / 10;
    res.status(200).send(JSON.stringify(avg));
  }
});

movieRouter.get('/updateRatings', async (_req: Request, res: Response) => {
  const movies = await Movie.find();

  for (const movie of movies) {
    const response = await fetch(
      process.env.SERVER_URL + '/movies/avgRating/' + movie._id,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    const body = await response.text();
    movie.avgRating = parseFloat(body);
    await movie.save();
  }

  res.sendStatus(200);
});

movieRouter.put('/updateRating', async (req: Request, res: Response) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie)
    return res
      .status(404)
      .send('The movie with the given ID was not found.');

  const response = await fetch(
    process.env.SERVER_URL + '/movies/avgRating/' + movie._id,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
  const body = await response.text();
  movie.avgRating = parseFloat(body);

  await movie.save();
  res.sendStatus(200);
});

movieRouter.get('/quote', async (_req: Request, res: Response) => {
  const quote = await Quote.find({
    createdOn: {
      $gte: new Date(new Date().getTime() - 7 * 60 * 60 * 24 * 1000),
    },
  })
    .sort({ createdOn: -1 })
    .limit(1);

  if (quote && quote.length > 0) return res.status(200).send(quote);

  const oneWeek = 24 * 60 * 60 * 1000 * 7;
  const firstDate = new Date(2021, 10, 14);
  const secondDate = new Date();
  const diffWeek = Math.floor(
    Math.abs((firstDate.getTime() - secondDate.getTime()) / oneWeek)
  );

  const index = diffWeek % quotes.length;
  const obj = quotes[index];

  res.status(200).send(obj);
});

movieRouter.post('/quote', [auth, admin], async (req: AuthRequest, res: Response) => {
  const validation = quoteSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).send(validation.error.issues[0].message);
  }

  const quote = new Quote({
    quote: req.body.quote,
    subquote: req.body.subquote,
  });

  await quote.save();
  res.status(200).send(quote);
});
