import express, { type Request, type Response } from 'express';
import { Movie, Quote } from '../models';
import { admin, auth } from '../middleware';
import { movieSchema, quoteSchema } from '../schemas';
import type { AuthRequest } from '../types';

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

movieRouter.put('/:id', [auth, admin], async (req: AuthRequest, res: Response) => {
  const validation = movieSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).send(validation.error.issues[0].message);
  }

  const movie = await Movie.findByIdAndUpdate(req.params.id, {
    $set: req.body,
  });

  if (!movie)
    return res
      .status(400)
      .send('The movie with the given ID was not found.');

  res.status(200).send();
});

movieRouter.get('/avgRating/:id', async (req: Request, res: Response) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie)
    return res
      .status(404)
      .send('The movie with the given ID was not found.');

  const ratings: number[] = [];

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

movieRouter.get('/quote', async (_req: Request, res: Response) => {
  const quote = await Quote.find({
    createdOn: {
      $gte: new Date(new Date().getTime() - 7 * 60 * 60 * 24 * 1000),
    },
  })
    .sort({ createdOn: -1 })
    .limit(1);

  if (quote && quote.length > 0) return res.status(200).send(quote);

  const quotes = [
    {
      quote: '"I never disrobe before gunplay."',
      subquote: "-John Miltion, 'Drive Angry'",
    },
    {
      quote: `"Cause I was made for this sewer baby and I am the king."`,
      subquote: `-Rick Santoro, 'Snake Eyes'.`,
    },
    {
      quote: `"Put the bunny back in the box."`,
      subquote: `-Cameron Poe, 'Con Air'.`,
    },
    {
      quote: `"What's in the bag? A shark or something?"`,
      subquote: `-Edward Malus, 'The Wicker Man'.`,
    },
    {
      quote: `"Shoot him again... His soul's still dancing."`,
      subquote: `-Terence McDonagh, 'Bad Lieutenant: Port Of Call'`,
    },
    {
      quote: `"I did a bare 360 triple backflip in front of twenty-two thousand people. It's kind of funny, it's on YouTube, check it out"`,
      subquote: `-Johnny Blaze, 'Ghost Rider: Spirit Of Vengeance'`,
    },
    {
      quote: `"I just stole fifty cars in one night! I'm a little tired, little wired, and I think I deserve a little appreciation!"`,
      subquote: `-Randall 'Memphis' Raines, 'Gone In Sixty Seconds'`,
    },
    {
      quote: `"Bangers and mash! Bubbles and squeak! Smoked eel pie! Haggis!"`,
      subquote: `-Ben Gates, 'National Treasure 2: Book Of Secrets'`,
    },
    {
      quote: `"Honey? Uh... You wanna know who really killed JFK?"`,
      subquote: `-Stanley Godspeed, 'Rock'`,
    },
    {
      quote: `"You'll be seeing a lot of changes around here. Papa's got a brand new bag."`,
      subquote: `-Castor Troy, 'Face/Off'`,
    },
    {
      quote: `"I'll be taking these Huggies and whatever cash ya got."`,
      subquote: `-H.I., 'Raising Arizona'.`,
    },
    {
      quote: `"People don't throw things at me anymore. Maybe because I carry a bow around."`,
      subquote: `-David Spritz, 'The Weather Man'.`,
    },
  ];

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
