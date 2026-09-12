import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { createApp } from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Project } from '../../src/models/Project.js';
import { ProjectMember } from '../../src/models/ProjectMember.js';
import { ErrorGroup } from '../../src/models/ErrorGroup.js';
import { ErrorOccurrence } from '../../src/models/ErrorOccurrence.js';

const app = createApp();

let accessToken;
let apiKey;
let projectId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    ProjectMember.deleteMany({}),
    ErrorGroup.deleteMany({}),
    ErrorOccurrence.deleteMany({}),
  ]);

  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Ingest Tester', email: 'ingest@example.com', password: 'Passw0rd123' });
  accessToken = registerRes.body.data.accessToken;

  const projectRes = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: 'Test Project', environment: 'production' });
  apiKey = projectRes.body.data.apiKey;
  projectId = projectRes.body.data.project.id;
});

describe('POST /api/ingest/error', () => {
  it('rejects an invalid API key', async () => {
    const res = await request(app).post('/api/ingest/error').send({ projectKey: 'dvt_test_invalid', message: 'x' });
    expect(res.status).toBe(401);
  });

  it('creates a new error group on first ingestion', async () => {
    const res = await request(app).post('/api/ingest/error').send({
      projectKey: apiKey,
      message: 'Database connection failed',
      severity: 'critical',
      service: 'db',
    });

    expect(res.status).toBe(202);
    expect(res.body.data.errorGroupId).toBeDefined();

    const group = await ErrorGroup.findById(res.body.data.errorGroupId);
    expect(group.occurrenceCount).toBe(1);
    expect(group.severity).toBe('critical');
  });

  it('groups near-duplicate errors (different IDs) into the same ErrorGroup', async () => {
    const stackTrace = 'Error: User not found\n    at getUser (/app/src/userService.js:42:11)';

    const res1 = await request(app).post('/api/ingest/error').send({
      projectKey: apiKey,
      message: 'User 111 not found',
      stackTrace,
      service: 'user-service',
    });
    const res2 = await request(app).post('/api/ingest/error').send({
      projectKey: apiKey,
      message: 'User 999 not found',
      stackTrace,
      service: 'user-service',
    });

    expect(res1.body.data.errorGroupId).toBe(res2.body.data.errorGroupId);

    const group = await ErrorGroup.findById(res1.body.data.errorGroupId);
    expect(group.occurrenceCount).toBe(2);
  });

  it('reopens a resolved error group when it recurs', async () => {
    const ingestRes = await request(app)
      .post('/api/ingest/error')
      .send({ projectKey: apiKey, message: 'Flaky error', service: 'api' });
    const errorId = ingestRes.body.data.errorGroupId;

    await request(app)
      .patch(`/api/errors/${errorId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'resolved' });

    await request(app).post('/api/ingest/error').send({ projectKey: apiKey, message: 'Flaky error', service: 'api' });

    const group = await ErrorGroup.findById(errorId);
    expect(group.status).toBe('open');
    expect(group.occurrenceCount).toBe(2);
  });
});

describe('GET /api/errors and PATCH /api/errors/:id', () => {
  it('lists errors scoped to the caller\'s projects only', async () => {
    await request(app).post('/api/ingest/error').send({ projectKey: apiKey, message: 'Listed error', service: 'api' });

    const res = await request(app).get('/api/errors').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.errors.length).toBeGreaterThan(0);
  });

  it('updates status and severity', async () => {
    const ingestRes = await request(app)
      .post('/api/ingest/error')
      .send({ projectKey: apiKey, message: 'To resolve', service: 'api' });
    const errorId = ingestRes.body.data.errorGroupId;

    const res = await request(app)
      .patch(`/api/errors/${errorId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'resolved', severity: 'warning' });

    expect(res.status).toBe(200);
    expect(res.body.data.error.status).toBe('resolved');
    expect(res.body.data.error.severity).toBe('warning');
  });

  it('denies access to an error from a project the user is not a member of', async () => {
    const ingestRes = await request(app)
      .post('/api/ingest/error')
      .send({ projectKey: apiKey, message: 'Private error', service: 'api' });
    const errorId = ingestRes.body.data.errorGroupId;

    const outsiderRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Outsider', email: 'outsider@example.com', password: 'Passw0rd123' });
    const outsiderToken = outsiderRes.body.data.accessToken;

    const res = await request(app).get(`/api/errors/${errorId}`).set('Authorization', `Bearer ${outsiderToken}`);
    expect(res.status).toBe(403);
  });
});
