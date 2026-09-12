import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { createApp } from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { RefreshToken } from '../../src/models/RefreshToken.js';

const app = createApp();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('creates a new user and returns an access token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Passw0rd123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // never leak the hash
    expect(res.body.data.accessToken).toBeDefined();
  });

    it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send({ name: 'User A', email: 'dup@example.com', password: 'Passw0rd123' });
    const res = await request(app).post('/api/auth/register').send({ name: 'User B', email: 'dup@example.com', password: 'Passw0rd123' });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects a password missing complexity requirements', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'User A', email: 'weak@example.com', password: 'weak' });
    expect(res.status).toBe(400);
  });

  it('rejects a missing required field', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'noname@example.com', password: 'Passw0rd123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login User', email: 'login@example.com', password: 'Passw0rd123' });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'Passw0rd123' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects an incorrect password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com', password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('rejects a non-existent email with 401 (not 404 — avoids leaking which emails are registered)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'Passw0rd123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the current user for a valid token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Me User', email: 'me@example.com', password: 'Passw0rd123' });
    const token = registerRes.body.data.accessToken;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@example.com');
  });

  it('rejects a request with no Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed/invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('issues a new access token given a valid refresh cookie', async () => {
    const agent = request.agent(app); // keeps cookies across requests, like a browser session
    await agent.post('/api/auth/register').send({ name: 'Refresh User', email: 'refresh@example.com', password: 'Passw0rd123' });

    const res = await agent.post('/api/auth/refresh');
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects a refresh attempt with no cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});
