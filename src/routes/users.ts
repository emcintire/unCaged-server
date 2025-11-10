import express, { Response } from 'express';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { auth } from '../middleware';
import { Movie, User } from '../models';
import { newUserSchema, loginSchema, updateUserSchema } from '../schemas';
import type { AuthRequest } from '../types';
import { getIdFromToken } from '../util';

export const userRouter = express.Router();

userRouter.get('/', async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
  const user = await User.findById(id);

  if (!user)
    return res
      .status(404)
      .send('The user with the given ID was not found.');

  res.status(200).send(user);
});

userRouter.post('/', async (req: express.Request, res: Response) => {
  const validation = newUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).send(validation.error.issues[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered');

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    img: 'https://i.imgur.com/9NYgErP.png',
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.send(token);
});

userRouter.put('/', auth, async (req: AuthRequest, res: Response) => {
  const validation = updateUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).send(validation.error.issues[0].message);
  }

  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
  const user = await User.findById(id);
  if (!user) return res.status(400).send('User not found');

  await User.findByIdAndUpdate(id, {
    $set: req.body,
  });

  res.status(200).send();
});

userRouter.put('/changePassword', auth, async (req: AuthRequest, res: Response) => {
  const validation = updateUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).send(validation.error.issues[0].message);
  }

  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
  const user = await User.findById(id);
  if (!user) return res.status(400).send('User not found');

  if (req.body.currentPassword) {
    const validPassword = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );
    if (!validPassword) return res.status(400).send('Invalid password');
  }

  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(req.body.password, salt);

  user.password = newPassword;
  await user.save();

  res.status(200).send();
});

userRouter.post('/login', async (req: express.Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).send(validation.error.issues[0].message);
  }

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

userRouter.delete('/', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
  const user = await User.findByIdAndRemove(id);

  if (!user)
    return res
      .status(404)
      .send('The user with the given ID was not found.');

  res.status(200).send();
});

userRouter.get('/favorites', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
  const user = await User.findById(id);

  if (!user)
    return res
      .status(404)
      .send('The user with the given ID was not found.');

  const movies = [];

  for (const movieId of user.favorites) {
    const movie = await Movie.findById(movieId);

    if (!movie)
      return res
        .status(404)
        .send('The movie with the given ID was not found.');

    movies.push(movie);
  }

  res.status(200).send(movies);
});

userRouter.put('/favorites', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
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

userRouter.delete('/favorites', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
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

userRouter.get('/unseen', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
  const user = await User.findById(id);

  if (!user)
    return res
      .status(404)
      .send('The user with the given ID was not found.');

  const unSeen = [];
  const movies = await Movie.find();

  for (const movie of movies) {
    if (!user.seen.includes(movie._id.toString())) {
      unSeen.push(movie);
    }
  }

  res.status(200).send(unSeen);
});

userRouter.get('/seen', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
  const user = await User.findById(id);

  if (!user)
    return res
      .status(404)
      .send('The user with the given ID was not found.');

  const movies = [];

  for (const movieId of user.seen) {
    const movie = await Movie.findById(movieId);

    if (!movie)
      return res
        .status(404)
        .send('The movie with the given ID was not found.');

    movies.push(movie);
  }

  res.status(200).send(movies);
});

userRouter.put('/seen', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
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

userRouter.delete('/seen', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
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

userRouter.get('/watchlist', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
  const user = await User.findById(id);

  if (!user)
    return res
      .status(404)
      .send('The user with the given ID was not found.');

  const movies = [];

  for (const movieId of user.watchlist) {
    const movie = await Movie.findById(movieId);

    if (!movie)
      return res
        .status(404)
        .send('The movie with the given ID was not found.');

    movies.push(movie);
  }

  res.status(200).send(movies);
});

userRouter.put('/watchlist', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
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

userRouter.delete('/watchlist', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
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

userRouter.get('/rate', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
  const user = await User.findById(id);

  if (!user)
    return res
      .status(404)
      .send('The user with the given ID was not found.');

  const movies = [];

  for (const rating of user.ratings) {
    const movie = await Movie.findById(rating.movie);

    if (!movie)
      return res
        .status(404)
        .send('The movie with the given ID was not found.');

    movies.push(movie);
  }

  res.status(200).send(movies);
});

userRouter.put('/rate', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
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

userRouter.delete('/rate', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
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

userRouter.post('/forgotPassword', async (req: express.Request, res: Response) => {
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

  const salt = await bcrypt.genSalt(10);
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

userRouter.post('/checkCode', async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
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

userRouter.post('/filteredMovies', auth, async (req: AuthRequest, res: Response) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('No token provided');
  
  const id = getIdFromToken(token);
  const user = await User.findById(id);

  if (!user) return res.status(404).send('The user with the given ID was not found.');

  let movies = await Movie.find();

  if (req.body.unseen) {
    movies = movies.filter((m) => user.seen.includes(m.id));
  }

  if (req.body.watchlist) {
    movies = movies.filter((m) => user.watchlist.includes(m.id));
  }

  if (req.body.mandy) {
    movies = movies.filter((m) => m.title === 'Mandy');
  }

  res.status(200).send(movies);
});

export default userRouter;
