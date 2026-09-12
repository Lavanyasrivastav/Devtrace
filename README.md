# DevTrace

A centralized error intelligence and application monitoring platform — a simplified, original-architecture take on what Sentry, LogRocket, and Datadog error monitoring do, built end-to-end with the MERN stack, Redis, BullMQ, and Socket.IO.

## Features

- **Error ingestion & grouping** — a public, API-key-authenticated endpoint accepts errors from any app; a SHA-256 fingerprinting engine normalizes dynamic values (IDs, UUIDs, emails, dates) so near-duplicate errors collapse into one issue automatically.
- **Stack trace parsing** — structured extraction of error name, message, file, line, and function across Node/V8 and browser (Firefox/Safari) stack formats.
- **Recurring error / spike detection** — a background worker flags issues occurring above a threshold rate.
- **Analytics dashboard** — total/unresolved/critical/resolved counts, error rate, frequency-over-time, severity/project breakdowns, all via MongoDB aggregation with Redis caching.
- **REST API monitoring** — periodic uptime checks against user-provided URLs, with response time history and uptime percentage.
- **Real-time updates** — Socket.IO (Redis-adapter backed, so it's cluster-ready) pushes new errors, status changes, spikes, and monitor status changes live to the dashboard.
- **Team workspace** — role-based access control (Owner/Admin/Developer/Viewer) enforced server-side on every project- and error-scoped route.
- **JWT auth with refresh rotation** — short-lived access tokens kept in memory on the client, long-lived refresh tokens hashed at rest and delivered via httpOnly cookie.

### Known scope limits (documented, not hidden)

A few features mentioned in early planning were deliberately **not** built, to avoid shipping fake/orphaned code:
- **Comments, activity log, and fix-history** — the Error Detail page's Activity and Fix History tabs show a "coming soon" state. These need `Comment`/`ErrorActivity`/`FixHistory` models that don't exist yet.
- **Log file upload ingestion** — no `/api/ingest/logfile` endpoint or `logWorker.js`. This was in the original feature brainstorm but never made it into the execution plan we followed phase-by-phase.
- **AI-based suggestion engine** — not built. The rule-based version referenced in early planning was also skipped; the architecture (a clean service layer per concern) would make it straightforward to add later.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, TanStack Query, Zustand, React Hook Form + Zod, Recharts, Socket.IO client, Lucide icons

**Backend:** Node.js, Express, MongoDB (Mongoose), Redis (ioredis), BullMQ, Socket.IO + Redis adapter, JWT, bcrypt, Zod, Winston, Swagger/OpenAPI

**DevOps:** Docker, Docker Compose, GitHub Actions CI, ESLint/Prettier

## Architecture

```
┌─────────────┐        HTTPS/WSS         ┌──────────────┐
│   Client    │ ───────────────────────► │    Server    │
│ React+Vite  │ ◄─────────────────────── │ Express + IO │
└─────────────┘                          └──────┬───────┘
                                                 │
                     ┌───────────────────────────┼───────────────────────────┐
                     ▼                           ▼                           ▼
              ┌─────────────┐            ┌──────────────┐            ┌──────────────┐
              │  MongoDB    │            │    Redis     │            │  BullMQ      │
              │ (Mongoose)  │            │ cache/ratelim│            │  Workers     │
              └─────────────┘            └──────────────┘            └──────────────┘
```

The API server and the background worker (`src/worker.js`) are **separate Node processes** — ingestion writes fast and enqueues heavier work (spike detection, monitoring checks) rather than doing it inline, so a burst of incoming errors never blocks the request path.

## Folder Structure

```
devtrace/
├── client/           React frontend (Vite)
│   └── src/
│       ├── api/          axios instance + endpoint modules
│       ├── components/   shared UI primitives
│       ├── hooks/        React Query hooks + auth/socket hooks
│       ├── layouts/      AppLayout, AuthLayout, PublicLayout, Sidebar, Topbar
│       ├── pages/        route-level pages
│       ├── routes/       route table + ProtectedRoute
│       └── store/        Zustand stores (auth, ui, project selection)
├── server/           Express backend
│   └── src/
│       ├── config/       env, db, redis, logger, queue, swagger
│       ├── controllers/  route handlers
│       ├── middleware/   auth, rbac, validation, rate limiting, error handling
│       ├── models/       Mongoose schemas
│       ├── routes/       route → controller wiring
│       ├── services/     fingerprinting, stack parsing, caching, spike detection
│       ├── sockets/       Socket.IO server + emitters
│       ├── workers/       BullMQ workers (aggregation, monitoring)
│       ├── validators/   Zod schemas
│       ├── app.js         Express app (importable, no listen — used by tests)
│       ├── server.js      HTTP + Socket.IO bootstrap
│       └── worker.js      background worker process entry point
│   └── tests/
│       ├── unit/          pure-function tests (fingerprinting, parsing, spike detection)
│       └── integration/   Supertest + real test-DB API tests
├── .github/workflows/ci.yml
├── docker-compose.yml
└── .env.example
```

## Installation & Local Development

### Option A — Docker Compose (fastest)

```bash
cp .env.example .env   # fill in JWT secrets
docker-compose up --build
```

This starts MongoDB, Redis, the API server, the background worker, and the client (served via nginx) — all in one command. Client at `http://localhost:5173`, API at `http://localhost:5000`.

### Option B — Run natively (for active development)

**Backend:**
```bash
cd server
npm install
cp .env.example .env
docker run -d --name devtrace-mongo -p 27017:27017 mongo:7
docker run -d --name devtrace-redis -p 6379:6379 redis:7
npm run dev          # API server, terminal 1
npm run worker:dev   # background worker, terminal 2
```

**Frontend:**
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

**`server/.env`**
| Variable | Description |
|---|---|
| `PORT` | API server port (default 5000) |
| `NODE_ENV` | `development` \| `production` \| `test` |
| `MONGODB_URI` | Mongo connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Long random strings — never commit real values |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | Token lifetimes (default `15m` / `30d`) |
| `CLIENT_URL` | Frontend origin, used for CORS and cookie scoping |
| `COOKIE_DOMAIN` | Cookie domain for the refresh token |

**`client/.env`**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SOCKET_URL` | Backend Socket.IO URL (usually same host, no `/api`) |

## Running Tests

```bash
# Server — needs a local MongoDB + Redis running (see Option B above)
cd server
npm test

# Client
cd client
npm test
```

Integration tests use a **separate test database** (`devtrace_test` by default, overridable via `TEST_MONGODB_URI`) and bypass rate limiting automatically in `NODE_ENV=test` — they never touch your dev data.

## API Documentation

Once the server is running, open `http://localhost:5000/api/docs` for interactive Swagger UI covering auth, projects, ingestion, errors, analytics, and monitors.

## Deployment Guide

### 1. MongoDB Atlas
Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), add a database user, whitelist your deployment platform's IP (or `0.0.0.0/0` for simplicity on a free tier), and copy the connection string into `MONGODB_URI`.

### 2. Redis (Upstash or Redis Cloud)
Create a free Redis instance at [upstash.com](https://upstash.com) or [redis.com/cloud](https://redis.com/try-free/). Copy the connection URL (with TLS if offered) into `REDIS_URL`.

### 3. Backend — Render or Railway
- Create a new Web Service from your repo, root directory `server`.
- Build command: `npm install`. Start command: `node src/server.js`.
- Set all env vars from the table above (`MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` = your deployed frontend URL, `COOKIE_DOMAIN` = your backend's domain).
- Deploy a **second** service the same way for the worker, with start command `node src/worker.js`.

### 4. Frontend — Vercel
- Import the repo, set root directory to `client`.
- Framework preset: Vite.
- Environment variables: `VITE_API_URL` = your deployed backend URL + `/api`, `VITE_SOCKET_URL` = your deployed backend URL.

### 5. CORS
`CLIENT_URL` on the backend must exactly match your deployed frontend origin (including protocol) — Express CORS will reject requests otherwise.

### 6. Cookies in production
With frontend and backend on different subdomains, set `COOKIE_DOMAIN` to the common parent domain (e.g. `.yourapp.com`) and ensure both are served over HTTPS — the refresh cookie is `Secure` and `SameSite=Strict` in production (see `authController.js`), which requires HTTPS to function.

### 7. Socket.IO in production
No extra configuration needed beyond `CLIENT_URL` — the Redis adapter is already wired in (`sockets/index.js`), so this deployment is ready to scale to multiple backend instances behind a load balancer without additional changes.

## Future Improvements

- Comments, activity log, and fix-history knowledge base (models + endpoints + UI)
- Log file upload ingestion pipeline
- Rule-based (then AI-based) fix suggestion engine
- Per-project configurable ingestion rate limits
- Multi-region worker deployment for monitoring checks
