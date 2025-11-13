import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { User, Movie } from '../models';
import type {
  RegisterUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  LoginDto,
  ForgotPasswordDto,
  CheckCodeDto,
  MovieActionDto,
  RateMovieDto,
  FilteredMoviesDto
} from './types';
import {
  newUserSchema,
  loginSchema,
  updateUserSchema,
  movieRatingSchema
} from '../schemas';

export class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    return user;
  }

  /**
   * Register a new user
   */
  async registerUser(dto: RegisterUserDto) {
    const validation = newUserSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const existingUser = await User.findOne({ email: dto.email });
    if (existingUser) {
      throw new Error('User already registered');
    }

    const user = new User({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      img: 'https://i.imgur.com/9NYgErP.png',
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    return user.generateAuthToken();
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, dto: UpdateUserDto) {
    const validation = updateUserSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const user = await User.findByIdAndUpdate(userId, { $set: dto });
    if (!user) {
      throw new Error('User not found');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const validation = updateUserSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (dto.currentPassword) {
      const validPassword = await bcrypt.compare(dto.currentPassword, user.password);
      if (!validPassword) {
        throw new Error('Invalid password');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(dto.password, salt);
    user.password = newPassword;
    await user.save();
  }

  /**
   * Login user
   */
  async login(dto: LoginDto) {
    const validation = loginSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      throw new Error('Invalid email or password');
    }

    return user.generateAuthToken();
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  /**
   * Get user's favorite movies
   */
  async getFavorites(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    return await Movie.find({ _id: { $in: user.favorites } });
  }

  /**
   * Add movie to favorites
   */
  async addFavorite(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $push: { favorites: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  /**
   * Remove movie from favorites
   */
  async removeFavorite(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $pull: { favorites: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  /**
   * Get unseen movies
   */
  async getUnseenMovies(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }

    const unseen = [];
    const movies = await Movie.find();

    for (const movie of movies) {
      if (!user.seen.includes(String(movie._id))) {
        unseen.push(movie);
      }
    }

    return unseen;
  }

  /**
   * Get seen movies
   */
  async getSeenMovies(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    return await Movie.find({ _id: { $in: user.seen } });
  }

  /**
   * Mark movie as seen
   */
  async markAsSeen(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $push: { seen: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  /**
   * Remove movie from seen
   */
  async removeFromSeen(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $pull: { seen: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  /**
   * Get watchlist
   */
  async getWatchlist(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    return await Movie.find({ _id: { $in: user.watchlist } });
  }

  /**
   * Add movie to watchlist
   */
  async addToWatchlist(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $push: { watchlist: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  /**
   * Remove movie from watchlist
   */
  async removeFromWatchlist(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $pull: { watchlist: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  /**
   * Get user ratings
   */
  async getRatings(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    return await Movie.find({ _id: { $in: user.ratings.map((r) => r.movie) } });
  }

  /**
   * Rate a movie
   */
  async rateMovie(userId: string, dto: RateMovieDto) {
    const validation = movieRatingSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const user = await User.findByIdAndUpdate(userId, {
      $push: {
        ratings: {
          movie: dto.id,
          rating: dto.rating,
        },
      },
    });

    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }

    const movie = await Movie.findByIdAndUpdate(dto.id, {
      $push: {
        ratings: {
          id: userId,
          rating: dto.rating,
        },
      },
    });

    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }
  }

  /**
   * Delete rating
   */
  async deleteRating(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $pull: {
        ratings: { movie: dto.id },
      },
    });

    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }

    const movie = await Movie.findByIdAndUpdate(dto.id, {
      $pull: {
        ratings: { id: userId },
      },
    });

    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }
  }

  /**
   * Forgot password - send reset code
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw new Error('No user with that email address');
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(randomNum, salt);

    user.resetCode = hashedCode;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: dto.email,
      subject: 'Forgot Password',
      text: `Code: ${randomNum}`,
    };

    await transporter.sendMail(mailOptions);
  }

  /**
   * Check password reset code
   */
  async checkResetCode(dto: CheckCodeDto) {
    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw new Error('No user with that email address');
    }

    const validCode = await bcrypt.compare(dto.code, user.resetCode);
    if (!validCode) {
      throw new Error('Invalid Code');
    }

    user.resetCode = '';
    await user.save();
  }

  /**
   * Get filtered movies
   */
  async getFilteredMovies(userId: string, dto: FilteredMoviesDto) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }

    let movies = await Movie.find();

    if (dto.unseen) {
      movies = movies.filter((m) => user.seen.includes(m.id));
    }

    if (dto.watchlist) {
      movies = movies.filter((m) => user.watchlist.includes(m.id));
    }

    if (dto.mandy) {
      movies = movies.filter((m) => m.title === 'Mandy');
    }

    return movies;
  }
}
