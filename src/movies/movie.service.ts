import { Movie, Quote } from '@/models';
import { movieSchema, quoteSchema } from '@/schemas';
import type {
  CreateMovieDto,
  UpdateMovieDto,
  GetMoviesDto,
  FindByTitleDto,
  CreateQuoteDto
} from './types';
import { quotes } from '@/util';

export class MovieService {
  /**
   * Get all movies with optional sorting
   */
  async getAllMovies(dto?: GetMoviesDto) {
    if (dto?.category && dto?.direction) {
      return await Movie.find().sort({
        [dto.category]: dto.direction,
      });
    }
    return await Movie.find().sort('director');
  }

  /**
   * Find movie by ID
   */
  async findMovieById(id: string) {
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }
    return movie;
  }

  /**
   * Find movies by title (regex search) with optional URL parameter
   */
  async findMoviesByTitleParam(title: string) {
    return await Movie.find({
      title: { $regex: title, $options: 'i' },
    });
  }

  /**
   * Find movies by title with sorting (body request)
   */
  async findMoviesByTitle(dto: FindByTitleDto) {
    if (dto.category && dto.direction) {
      if (dto.title) {
        return await Movie.find({
          title: { $regex: dto.title, $options: 'i' },
        }).sort({
          [dto.category]: dto.direction,
        });
      } else {
        return await Movie.find().sort({
          [dto.category]: dto.direction,
        });
      }
    }

    // Default sort when category/direction not provided
    if (dto.title) {
      return await Movie.find({
        title: { $regex: dto.title, $options: 'i' },
      }).sort('director');
    } else {
      return await Movie.find().sort('director');
    }
  }

  /**
   * Create a new movie
   */
  async createMovie(dto: CreateMovieDto) {
    const validation = movieSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const movieAlreadyExists = await Movie.findOne({ title: dto.title }) != null;
    if (movieAlreadyExists) {
      throw new Error('Movie already registered');
    }

    const movie = new Movie({
      title: dto.title,
      director: dto.director,
      description: dto.description,
      date: dto.date,
      rating: dto.rating,
      runtime: dto.runtime,
      img: dto.img,
      genres: dto.genres,
    });

    await movie.save();
  }

  /**
   * Update a movie
   */
  async updateMovie(id: string, dto: UpdateMovieDto) {
    const validation = movieSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const movie = await Movie.findByIdAndUpdate(id, { $set: dto });
    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }
  }

  /**
   * Get average rating for a movie
   */
  async getAverageRating(id: string) {
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }

    const ratings = movie.ratings.map((rating) => rating.rating);

    if (ratings.length === 0) {
      return '0';
    } else {
      const avg = Math.round(ratings.reduce((a, b) => a + b) / ratings.length * 10) / 10;
      return JSON.stringify(avg);
    }
  }

  /**
   * Update all movie ratings from API
   */
  async updateAllRatings() {
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
  }

  /**
   * Update single movie rating
   */
  async updateMovieRating(id: string) {
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }

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

  /**
   * Get quote of the day/week
   */
  async getQuote() {
    const quote = await Quote.find({
      createdOn: {
        $gte: new Date(new Date().getTime() - 7 * 60 * 60 * 24 * 1000),
      },
    })
      .sort({ createdOn: -1 })
      .limit(1);

    if (quote && quote.length > 0) return quote;

    const oneWeek = 24 * 60 * 60 * 1000 * 7;
    const firstDate = new Date(2021, 10, 14);
    const secondDate = new Date();
    const diffWeek = Math.floor(
      Math.abs((firstDate.getTime() - secondDate.getTime()) / oneWeek)
    );

    const index = diffWeek % quotes.length;
    return quotes[index];
  }

  /**
   * Create a new quote
   */
  async createQuote(dto: CreateQuoteDto) {
    const validation = quoteSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const quote = new Quote({
      quote: dto.quote,
      subquote: dto.subquote,
    });

    await quote.save();
    return quote;
  }
}
