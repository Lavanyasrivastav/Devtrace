// Runs before any test file or app module is imported. dotenv.config() (used
// in config/env.js) does not override variables that are already set, so
// setting these here first guarantees tests use an isolated database and
// bypass rate limiting, even if a real .env file exists in this folder.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/devtrace_test';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_do_not_use_in_prod';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_jwt_refresh_secret_do_not_use_in_prod';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
