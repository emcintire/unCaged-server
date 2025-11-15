import type { Response, Request } from 'express';
import { MovieService } from './movie.service';
import type {
  GetMoviesDto,
  FindByTitleDto,
  CreateMovieDto,
  UpdateMovieDto,
  CreateQuoteDto
} from './types';

const movieService = new MovieService();

export class MovieController {
  /**
   * GET /api/movies - Get all movies
   */
  async getAllMovies(_req: Request<unknown, unknown, GetMoviesDto>, res: Response) {
    try {
      const movies = await movieService.getAllMovies();
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * POST /api/movies/getMovies - Get movies with sorting
   */
  async getMoviesWithSort(req: Request<unknown, unknown, GetMoviesDto>, res: Response) {
    try {
      const movies = await movieService.getAllMovies(req.body);
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * GET /api/movies/findByID/:id - Find movie by ID
   */
  async findMovieById(req: Request<{ id: string }>, res: Response) {
    try {
      const movie = await movieService.findMovieById(req.params.id);
      res.status(200).send(movie);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * GET /api/movies/findByTitle/:title - Find movies by title (URL param)
   */
  async findMoviesByTitleParam(req: Request<{ title: string }>, res: Response) {
    try {
      const movies = await movieService.findMoviesByTitleParam(req.params.title);
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * POST /api/movies/findByTitle - Find movies by title with sorting
   */
  async findMoviesByTitle(req: Request<unknown, unknown, FindByTitleDto>, res: Response) {
    try {
      const movies = await movieService.findMoviesByTitle(req.body);
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * POST /api/movies - Create a new movie
   */
  async createMovie(req: Request<unknown, unknown, CreateMovieDto>, res: Response) {
    try {
      await movieService.createMovie(req.body);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * PUT /api/movies/:id - Update a movie
   */
  async updateMovie(req: Request<{ id: string }, unknown, UpdateMovieDto>, res: Response) {
    try {
      await movieService.updateMovie(req.params.id, req.body);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * GET /api/movies/avgRating/:id - Get average rating
   */
  async getAverageRating(req: Request<{ id: string }>, res: Response) {
    try {
      const avgRating = await movieService.getAverageRating(req.params.id);
      res.status(200).send(avgRating);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * GET /api/movies/updateRatings - Update all movie ratings
   */
  async updateAllRatings(_req: Request, res: Response) {
    try {
      await movieService.updateAllRatings();
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * PUT /api/movies/updateRating/:id - Update single movie rating
   */
  async updateMovieRating(req: Request<{ id: string }>, res: Response) {
    try {
      await movieService.updateMovieRating(req.params.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * GET /api/movies/quote - Get quote of the day
   */
  async getQuote(_req: Request, res: Response) {
    try {
      const quote = await movieService.getQuote();
      res.status(200).send(quote);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  /**
   * POST /api/movies/quote - Create a new quote
   */
  async createQuote(req: Request<unknown, unknown, CreateQuoteDto>, res: Response) {
    try {
      const quote = await movieService.createQuote(req.body);
      res.status(200).send(quote);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }
}
