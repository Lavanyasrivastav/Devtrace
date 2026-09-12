import { ErrorGroup } from '../models/ErrorGroup.js';
import { ErrorOccurrence } from '../models/ErrorOccurrence.js';
import { Project } from '../models/Project.js';
import { resolveProjectIds } from '../services/projectAccessService.js';
import { buildProjectCacheKey, getOrSetCache, DEFAULT_TTL_SECONDS } from '../services/cacheService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { success } from '../utils/apiResponse.js';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Caching only applies when the request is scoped to a single project (the
// common dashboard case). The "all of my projects" aggregate view is cheap
// enough and changes shape too often per-user to be worth a cache key for.
async function withProjectCache(projectId, cacheSuffix, computeFn) {
  if (!projectId) return computeFn();
  const key = await buildProjectCacheKey(projectId, cacheSuffix);
  return getOrSetCache(key, DEFAULT_TTL_SECONDS, computeFn);
}

export const getOverview = catchAsync(async (req, res) => {
  const { projectId } = req.validatedQuery;
  const projectIds = await resolveProjectIds(req.user._id, projectId);

  const compute = async () => {
    const todayStart = startOfToday();
    const hoursElapsedToday = Math.max(1, (Date.now() - todayStart.getTime()) / (1000 * 60 * 60));

    const [totalErrors, unresolvedErrors, resolvedErrors, criticalErrors, errorsToday] = await Promise.all([
      ErrorGroup.countDocuments({ project: { $in: projectIds } }),
      ErrorGroup.countDocuments({ project: { $in: projectIds }, status: 'open' }),
      ErrorGroup.countDocuments({ project: { $in: projectIds }, status: 'resolved' }),
      ErrorGroup.countDocuments({ project: { $in: projectIds }, status: 'open', severity: 'critical' }),
      ErrorOccurrence.countDocuments({ project: { $in: projectIds }, timestamp: { $gte: todayStart } }),
    ]);

    const errorRate = Math.round((errorsToday / hoursElapsedToday) * 100) / 100;

    return { totalErrors, unresolvedErrors, resolvedErrors, criticalErrors, errorsToday, errorRate };
  };

  const data = await withProjectCache(projectId, 'overview', compute);

  return success(res, { message: 'Overview retrieved', data });
});

export const getFrequency = catchAsync(async (req, res) => {
  const { projectId, range } = req.validatedQuery;
  const projectIds = await resolveProjectIds(req.user._id, projectId);

  const compute = async () => {
    const now = new Date();
    const rangeConfig = {
      '24h': { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), unit: 'hour' },
      '7d': { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), unit: 'day' },
      '30d': { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), unit: 'day' },
    };
    const { start, unit } = rangeConfig[range];

    const results = await ErrorOccurrence.aggregate([
      { $match: { project: { $in: projectIds }, timestamp: { $gte: start } } },
      { $group: { _id: { $dateTrunc: { date: '$timestamp', unit } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return { range, points: results.map((r) => ({ timestamp: r._id, count: r.count })) };
  };

  const data = await withProjectCache(projectId, `frequency:${range}`, compute);

  return success(res, { message: 'Frequency retrieved', data });
});

export const getBySeverity = catchAsync(async (req, res) => {
  const { projectId } = req.validatedQuery;
  const projectIds = await resolveProjectIds(req.user._id, projectId);

  const compute = async () => {
    const results = await ErrorGroup.aggregate([
      { $match: { project: { $in: projectIds }, status: 'open' } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    const counts = { info: 0, warning: 0, error: 0, critical: 0 };
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return { bySeverity: counts };
  };

  const data = await withProjectCache(projectId, 'by-severity', compute);

  return success(res, { message: 'Severity breakdown retrieved', data });
});

export const getByProject = catchAsync(async (req, res) => {
  const projectIds = await resolveProjectIds(req.user._id, undefined); // always all-of-user's-projects for this chart

  const results = await ErrorGroup.aggregate([
    { $match: { project: { $in: projectIds }, status: 'open' } },
    { $group: { _id: '$project', count: { $sum: 1 } } },
  ]);

  const projects = await Project.find({ _id: { $in: results.map((r) => r._id) } }).select('name');
  const nameById = Object.fromEntries(projects.map((p) => [p._id.toString(), p.name]));

  return success(res, {
    message: 'Project breakdown retrieved',
    data: {
      byProject: results.map((r) => ({
        projectId: r._id,
        projectName: nameById[r._id.toString()] || 'Unknown project',
        count: r.count,
      })),
    },
  });
});

export const getTopErrors = catchAsync(async (req, res) => {
  const { projectId, limit } = req.validatedQuery;
  const projectIds = await resolveProjectIds(req.user._id, projectId);

  const compute = async () => {
    const topErrors = await ErrorGroup.find({ project: { $in: projectIds }, status: 'open' })
      .sort({ occurrenceCount: -1 })
      .limit(limit);
    return { topErrors: topErrors.map((e) => e.toSafeObject()) };
  };

  const data = await withProjectCache(projectId, `top-errors:${limit}`, compute);

  return success(res, { message: 'Top errors retrieved', data });
});
