import dotenv from 'dotenv';

dotenv.config();

const required = [
  'MONGODB_URI',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
];

function assertRequiredEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    // Fail fast and loud rather than limping along with undefined secrets.
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

assertRequiredEnv();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
  clientUrl: process.env.CLIENT_URL,
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  isProd: (process.env.NODE_ENV || 'development') === 'production',
};
