import request from 'supertest';
import app from '../app';
import { Movie } from '../models/movie';
import { User } from '../models/user';
import { movieSchema } from '../schemas';
import bcrypt from 'bcrypt';

describe('Movie API Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let movieId: string;

  beforeAll(async () => {
    // Create admin user
    const adminSalt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('AdminPass123', adminSalt);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      isAdmin: true,
      img: 'https://i.imgur.com/9NYgErP.png',
    });
    await admin.save();
    adminToken = admin.generateAuthToken();

    // Create regular user
    const userSalt = await bcrypt.genSalt(10);
    const userPassword = await bcrypt.hash('UserPass123', userSalt);
    const user = new User({
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      isAdmin: false,
      img: 'https://i.imgur.com/9NYgErP.png',
    });
    await user.save();
    userToken = user.generateAuthToken();
  });

  beforeEach(async () => {
    await Movie.deleteMany({});
  });

  afterAll(async () => {
    await Movie.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/movies - Get All Movies', () => {
    it('should return all movies sorted by director', async () => {
      await Movie.create([
        {
          title: 'Movie A',
          director: 'Director Z',
          date: '2020',
          runtime: '120 min',
          rating: 'PG-13',
          img: 'https://example.com/a.jpg',
        },
        {
          title: 'Movie B',
          director: 'Director A',
          date: '2021',
          runtime: '100 min',
          rating: 'R',
          img: 'https://example.com/b.jpg',
        },
      ]);

      const response = await request(app).get('/api/movies').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].director).toBe('Director A');
      expect(response.body[1].director).toBe('Director Z');
    });

    it('should return empty array when no movies exist', async () => {
      const response = await request(app).get('/api/movies').expect(200);

      expect(response.body).toEqual([]);
    });

    it('should type-check movie response structure', async () => {
      await Movie.create({
        title: 'Type Check Movie',
        director: 'Director Name',
        date: '2022',
        runtime: '110 min',
        rating: 'PG',
        img: 'https://example.com/movie.jpg',
      });

      const response = await request(app).get('/api/movies').expect(200);

      const movie = response.body[0];
      expect(movie).toHaveProperty('title');
      expect(movie).toHaveProperty('director');
      expect(movie).toHaveProperty('date');
      expect(movie).toHaveProperty('runtime');
      expect(movie).toHaveProperty('rating');
      expect(typeof movie.title).toBe('string');
      expect(typeof movie.director).toBe('string');
    });
  });

  describe('POST /api/movies - Create Movie', () => {
    it('should create a new movie with admin token', async () => {
      const newMovie = {
        title: 'New Movie',
        director: 'John Director',
        description: 'A great movie',
        date: '2023',
        runtime: '130 min',
        rating: 'R',
        img: 'https://example.com/new.jpg',
        genres: ['Action', 'Thriller'],
      };

      await request(app)
        .post('/api/movies')
        .set('x-auth-token', adminToken)
        .send(newMovie)
        .expect(200);

      const movie = await Movie.findOne({ title: 'New Movie' });
      expect(movie).toBeTruthy();
      expect(movie?.director).toBe('John Director');
      expect(movie?.genres).toEqual(['Action', 'Thriller']);
    });

    it('should validate movie input with Zod schema', () => {
      const validMovie = {
        title: 'Valid Movie',
        director: 'Valid Director',
        date: '2023',
        runtime: '120 min',
        rating: 'PG-13',
      };

      const result = movieSchema.safeParse(validMovie);
      expect(result.success).toBe(true);
    });

    it('should reject movie creation without admin privileges', async () => {
      const newMovie = {
        title: 'Unauthorized Movie',
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
      };

      await request(app)
        .post('/api/movies')
        .set('x-auth-token', userToken)
        .send(newMovie)
        .expect(401);
    });

    it('should reject movie creation without authentication', async () => {
      const newMovie = {
        title: 'No Auth Movie',
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
      };

      await request(app).post('/api/movies').send(newMovie).expect(401);
    });

    it('should reject duplicate movie titles', async () => {
      const movie = {
        title: 'Duplicate Movie',
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
      };

      await request(app)
        .post('/api/movies')
        .set('x-auth-token', adminToken)
        .send(movie)
        .expect(200);

      const response = await request(app)
        .post('/api/movies')
        .set('x-auth-token', adminToken)
        .send(movie)
        .expect(400);

      expect(response.text).toContain('already registered');
    });

    it('should type-check movie creation input', () => {
      const movieData = {
        title: 'Type Safe Movie',
        director: 'Type Director',
        date: '2023',
        runtime: '115 min',
        rating: 'PG-13',
        description: 'A type-safe movie',
        genres: ['Drama'],
      };

      const validation = movieSchema.safeParse(movieData);
      if (validation.success) {
        const typedData = validation.data;
        expect(typedData.title).toBe('Type Safe Movie');
        expect(typedData.director).toBe('Type Director');
        expect(Array.isArray(typedData.genres)).toBe(true);
      }
    });
  });

  describe('GET /api/movies/findByID/:id - Get Movie by ID', () => {
    beforeEach(async () => {
      const movie = await Movie.create({
        title: 'Test Movie',
        director: 'Test Director',
        date: '2023',
        runtime: '120 min',
        rating: 'PG-13',
        img: 'https://example.com/test.jpg',
      });
      movieId = movie._id.toString();
    });

    it('should return movie by valid ID', async () => {
      const response = await request(app)
        .get(`/api/movies/findByID/${movieId}`)
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Test Movie');
      expect(response.body).toHaveProperty('director', 'Test Director');
    });

    it('should return 404 for non-existent movie ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app).get(`/api/movies/findByID/${fakeId}`).expect(404);
    });
  });

  describe('POST /api/movies/findByTitle - Search Movies by Title', () => {
    beforeEach(async () => {
      await Movie.create([
        {
          title: 'The Great Movie',
          director: 'Director A',
          date: '2020',
          runtime: '120 min',
          rating: 'PG',
        },
        {
          title: 'Great Adventure',
          director: 'Director B',
          date: '2021',
          runtime: '110 min',
          rating: 'PG-13',
        },
        {
          title: 'Different Title',
          director: 'Director C',
          date: '2022',
          runtime: '100 min',
          rating: 'R',
        },
      ]);
    });

    it('should find movies by partial title match', async () => {
      const response = await request(app)
        .post('/api/movies/findByTitle')
        .send({ title: 'Great', category: 'title', direction: 1 })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.some((m: any) => m.title === 'The Great Movie')).toBe(true);
      expect(response.body.some((m: any) => m.title === 'Great Adventure')).toBe(true);
    });

    it('should return all movies when no title provided', async () => {
      const response = await request(app)
        .post('/api/movies/findByTitle')
        .send({ category: 'director', direction: 1 })
        .expect(200);

      expect(response.body).toHaveLength(3);
    });

    it('should be case-insensitive in search', async () => {
      const response = await request(app)
        .post('/api/movies/findByTitle')
        .send({ title: 'great', category: 'title', direction: 1 })
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/movies/:id - Update Movie', () => {
    beforeEach(async () => {
      const movie = await Movie.create({
        title: 'Update Test Movie',
        director: 'Original Director',
        date: '2020',
        runtime: '100 min',
        rating: 'PG',
      });
      movieId = (movie._id as any).toString();
    });

    it('should update movie with admin token', async () => {
      const updateData = {
        title: 'Update Test Movie',
        director: 'Updated Director',
        date: '2020',
        runtime: '110 min',
        rating: 'PG-13',
      };

      await request(app)
        .put(`/api/movies/${movieId}`)
        .set('x-auth-token', adminToken)
        .send(updateData)
        .expect(200);

      const movie = await Movie.findById(movieId);
      expect(movie?.director).toBe('Updated Director');
      expect(movie?.runtime).toBe('110 min');
    });

    it('should reject update without admin privileges', async () => {
      const updateData = {
        title: 'Update Test Movie',
        director: 'Unauthorized Update',
        date: '2020',
        runtime: '100 min',
        rating: 'PG',
      };

      await request(app)
        .put(`/api/movies/${movieId}`)
        .set('x-auth-token', userToken)
        .send(updateData)
        .expect(401);
    });
  });

  describe('GET /api/movies/avgRating/:id - Get Average Rating', () => {
    beforeEach(async () => {
      const movie = await Movie.create({
        title: 'Rating Test Movie',
        director: 'Director',
        date: '2023',
        runtime: '120 min',
        rating: 'PG-13',
        ratings: [
          { id: 'user1', rating: 8 },
          { id: 'user2', rating: 9 },
          { id: 'user3', rating: 7 },
        ],
      });
      movieId = (movie._id as any).toString();
    });

    it('should calculate correct average rating', async () => {
      const response = await request(app)
        .get(`/api/movies/avgRating/${movieId}`)
        .expect(200);

      const avgRating = parseFloat(response.text);
      expect(avgRating).toBe(8); // (8 + 9 + 7) / 3 = 8
    });

    it('should return 0 for movie with no ratings', async () => {
      const newMovie = await Movie.create({
        title: 'No Ratings Movie',
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
        ratings: [],
      });

      const response = await request(app)
        .get(`/api/movies/avgRating/${newMovie._id}`)
        .expect(200);

      expect(response.text).toBe('0');
    });
  });

  describe('Type Safety Tests', () => {
    it('should validate complete movie schema', () => {
      const completeMovie = {
        title: 'Complete Movie',
        director: 'Complete Director',
        description: 'A complete description',
        date: '2023',
        runtime: '120 min',
        rating: 'R',
        img: 'https://example.com/img.jpg',
        genres: ['Action', 'Drama', 'Thriller'],
      };

      const validation = movieSchema.safeParse(completeMovie);
      expect(validation.success).toBe(true);

      if (validation.success) {
        expect(validation.data.title).toBe('Complete Movie');
        expect(validation.data.genres).toHaveLength(3);
      }
    });

    it('should reject invalid movie schema', () => {
      const invalidMovie = {
        title: '', // Too short
        director: 'Director',
        date: '2023',
        runtime: '120 min',
        rating: 'PG',
      };

      const validation = movieSchema.safeParse(invalidMovie);
      expect(validation.success).toBe(false);
    });
  });
});
