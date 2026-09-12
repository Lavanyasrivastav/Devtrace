import { redis } from '../config/redis.js';

export const DEFAULT_TTL_SECONDS = 30; // dashboard data can be briefly stale; short TTL bounds that staleness

function versionKey(projectId) {
  return `cache:version:project:${projectId}`;
}

export async function getProjectCacheVersion(projectId) {
  const version = await redis.get(versionKey(projectId));
  return version ? parseInt(version, 10) : 1;
}

// Bumping the version makes every previously-cached key for this project
// unreachable (since cache keys embed the version), which is effectively
// instant invalidation without needing to enumerate or delete old keys.
export async function bumpProjectCacheVersion(projectId) {
  await redis.incr(versionKey(projectId));
}

export async function buildProjectCacheKey(projectId, suffix) {
  const version = await getProjectCacheVersion(projectId);
  return `cache:project:${projectId}:v${version}:${suffix}`;
}

export async function getOrSetCache(key, ttlSeconds, computeFn) {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  const fresh = await computeFn();
  await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
  return fresh;
}
