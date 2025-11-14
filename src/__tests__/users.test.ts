import request from 'supertest';
import app from '../app';
import { User } from '../models/user';
import { userSchema, loginSchema, updateUserSchema } from '../schemas';
import bcrypt from 'bcrypt';

describe('User API Endpoints', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Clean up users before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/users - User Registration', () => {
    it('should register a new user with valid data', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(200);

      expect(response.text).toBeTruthy();
      authToken = response.text;

      const user = await User.findOne({ email: newUser.email });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(newUser.name);
      expect(user?.email).toBe(newUser.email);
      expect(user?.password).not.toBe(newUser.password); // Should be hashed
    });

    it('should validate user input with Zod schema', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass1',
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const invalidUser = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'TestPass123',
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.text).toContain('email');
    });

    it('should reject weak password', async () => {
      const weakPasswordUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
      };

      const response = await request(app)
        .post('/api/users')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.text).toContain('Password');
    });

    it('should reject duplicate email registration', async () => {
      const user = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'TestPass123',
      };

      await request(app).post('/api/users').send(user).expect(200);

      const response = await request(app)
        .post('/api/users')
        .send(user)
        .expect(400);

      expect(response.text).toContain('already registered');
    });

    it('should type-check user creation input', () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
      };

      const validation = userSchema.safeParse(userData);
      if (validation.success) {
        const typedData = validation.data;
        expect(typedData.name).toBe('Jane Doe');
        expect(typedData.email).toBe('jane@example.com');
      }
    });
  });

  describe('POST /api/users/login - User Login', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Login Test',
        email: 'login@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
      });
      await user.save();
      userId = user._id.toString();
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'login@example.com',
        password: 'TestPass123',
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials)
        .expect(200);

      expect(response.text).toBeTruthy();
      authToken = response.text;
    });

    it('should validate login input with Zod schema', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'ValidPass1',
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject login with invalid email', async () => {
      const credentials = {
        email: 'wrong@example.com',
        password: 'TestPass123',
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials)
        .expect(400);

      expect(response.text).toContain('Invalid email or password');
    });

    it('should reject login with wrong password', async () => {
      const credentials = {
        email: 'login@example.com',
        password: 'WrongPass123',
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials)
        .expect(400);

      expect(response.text).toContain('Invalid email or password');
    });
  });

  describe('GET /api/users - Get User Profile', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Profile Test',
        email: 'profile@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
      });
      await user.save();
      authToken = (user.generateAuthToken as any)();
      userId = (user._id as any).toString();
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('x-auth-token', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Profile Test');
      expect(response.body).toHaveProperty('email', 'profile@example.com');
      expect(response.body).toHaveProperty('_id', userId);
    });

    it('should reject request without token', async () => {
      await request(app).get('/api/users').expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app)
        .get('/api/users')
        .set('x-auth-token', 'invalid-token')
        .expect(400);
    });
  });

  describe('PUT /api/users - Update User', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Update Test',
        email: 'update@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
      });
      await user.save();
      authToken = user.generateAuthToken();
      userId = user._id.toString();
    });

    it('should update user profile with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        img: 'https://i.imgur.com/newimage.png',
      };

      await request(app)
        .put('/api/users')
        .set('x-auth-token', authToken)
        .send(updateData)
        .expect(200);

      const user = await User.findById(userId);
      expect(user?.name).toBe('Updated Name');
      expect(user?.img).toBe('https://i.imgur.com/newimage.png');
    });

    it('should validate update input with Zod schema', () => {
      const updateData = {
        name: 'New Name',
        email: 'newemail@example.com',
      };

      const result = updateUserSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should type-check update data', () => {
      const updateData = {
        name: 'Type Check Name',
        img: 'https://example.com/img.png',
      };

      const validation = updateUserSchema.safeParse(updateData);
      if (validation.success) {
        const typedData = validation.data;
        expect(typeof typedData.name).toBe('string');
        expect(typeof typedData.img).toBe('string');
      }
    });
  });

  describe('DELETE /api/users - Delete User', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Delete Test',
        email: 'delete@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
      });
      await user.save();
      authToken = (user.generateAuthToken as any)();
      userId = (user._id as any).toString();
    });

    it('should delete user account with valid token', async () => {
      await request(app)
        .delete('/api/users')
        .set('x-auth-token', authToken)
        .expect(200);

      const user = await User.findById(userId);
      expect(user).toBeNull();
    });
  });

  describe('User Watchlist, Favorites, and Seen Operations', () => {
    let movieId: string;

    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'List Test',
        email: 'lists@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
        watchlist: [],
        favorites: [],
        seen: [],
      });
      await user.save();
      authToken = user.generateAuthToken();
      userId = user._id.toString();
      movieId = '507f1f77bcf86cd799439011'; // Mock movie ID
    });

    describe('Watchlist Operations', () => {
      it('should add movie to watchlist', async () => {
        await request(app)
          .put('/api/users/watchlist')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.watchlist).toContain(movieId);
      });

      it('should remove movie from watchlist', async () => {
        await User.findByIdAndUpdate(userId, {
          $push: { watchlist: movieId },
        });

        await request(app)
          .delete('/api/users/watchlist')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.watchlist).not.toContain(movieId);
      });
    });

    describe('Favorites Operations', () => {
      it('should add movie to favorites', async () => {
        await request(app)
          .put('/api/users/favorites')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.favorites).toContain(movieId);
      });

      it('should remove movie from favorites', async () => {
        await User.findByIdAndUpdate(userId, {
          $push: { favorites: movieId },
        });

        await request(app)
          .delete('/api/users/favorites')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.favorites).not.toContain(movieId);
      });
    });

    describe('Seen Operations', () => {
      it('should add movie to seen list', async () => {
        await request(app)
          .put('/api/users/seen')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.seen).toContain(movieId);
      });

      it('should remove movie from seen list', async () => {
        await User.findByIdAndUpdate(userId, {
          $push: { seen: movieId },
        });

        await request(app)
          .delete('/api/users/seen')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.seen).not.toContain(movieId);
      });
    });
  });
});
