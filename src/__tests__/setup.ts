import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Set test environment variables FIRST, before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_PRIVATE_KEY = 'test-jwt-secret-key-for-testing';

// Set up in-memory MongoDB before all tests
beforeAll(async () => {
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set the DB_URL to the in-memory database
  process.env.DB_URL = mongoUri;
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Clean up after all tests
afterAll(async () => {
  // Close all database connections
  await mongoose.disconnect();
  
  // Stop the in-memory MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 10000); // Increase timeout for cleanup

// Clear all collections between tests for isolation
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
