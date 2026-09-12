import { ErrorGroup } from '../models/ErrorGroup.js';
import { ErrorOccurrence } from '../models/ErrorOccurrence.js';
import { parseStackTrace } from '../services/stackTrace/index.js';
import { resolveProjectIds } from '../services/projectAccessService.js';
import { bumpProjectCacheVersion } from '../services/cacheService.js';
import { emitErrorStatusChanged } from '../sockets/emitters.js';
import { catchAsync } from '../utils/catchAsync.js';
import { success } from '../utils/apiResponse.js';

// Severity is a string enum, so a plain string sort would put "warning"
// ahead of "critical" (alphabetical). This $addFields stage maps each
// severity to a numeric rank so "critical" sort actually means critical-first.
const SEVERITY_RANK_STAGE = {
  $addFields: {
    severityRank: {
      $switch: {
        branches: [
          { case: { $eq: ['$severity', 'critical'] }, then: 4 },
          { case: { $eq: ['$severity', 'error'] }, then: 3 },
          { case: { $eq: ['$severity', 'warning'] }, then: 2 },
          { case: { $eq: ['$severity', 'info'] }, then: 1 },
        ],
        default: 0,
      },
    },
  },
};

const SORT_MAP = {
  recent: { lastSeen: -1 },
  frequent: { occurrenceCount: -1 },
  critical: { severityRank: -1, lastSeen: -1 },
  oldest: { firstSeen: 1 },
};

function toSafeErrorObject(doc) {
  return {
    id: doc._id,
    project: doc.project,
    title: doc.title,
    errorType: doc.errorType,
    service: doc.service,
    environment: doc.environment,
    severity: doc.severity,
    status: doc.status,
    assignee: doc.assignee,
    firstSeen: doc.firstSeen,
    lastSeen: doc.lastSeen,
    occurrenceCount: doc.occurrenceCount,
    trend: doc.trend,
  };
}

export const listErrors = catchAsync(async (req, res) => {
  const { projectId, severity, status, environment, service, search, sortBy, page, limit } = req.validatedQuery;

  const projectIds = await resolveProjectIds(req.user._id, projectId);

  const match = { project: { $in: projectIds } };
  if (severity) match.severity = severity;
  if (status) match.status = status;
  if (environment) match.environment = environment;
  if (service) match.service = service;
  if (search) match.title = { $regex: search, $options: 'i' };

  const skip = (page - 1) * limit;

  const [result] = await ErrorGroup.aggregate([
    { $match: match },
    SEVERITY_RANK_STAGE,
    { $sort: SORT_MAP[sortBy] },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const total = result.totalCount[0]?.count || 0;

  return success(res, {
    message: 'Errors retrieved',
    data: {
      errors: result.data.map(toSafeErrorObject),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
});

export const getErrorDetail = catchAsync(async (req, res) => {
  const parsedSampleStack = parseStackTrace(req.errorGroup.sampleStackTrace);

  return success(res, {
    message: 'Error detail retrieved',
    data: {
      error: req.errorGroup.toSafeObject(),
      sampleStackTrace: req.errorGroup.sampleStackTrace,
      parsedSampleStack,
      myRole: req.projectMember.role,
    },
  });
});

export const updateError = catchAsync(async (req, res) => {
  Object.assign(req.errorGroup, req.body);
  await req.errorGroup.save();
  await bumpProjectCacheVersion(req.errorGroup.project);
  emitErrorStatusChanged(req.errorGroup.project.toString(), req.errorGroup.toSafeObject());

  return success(res, {
    message: 'Error updated',
    data: { error: req.errorGroup.toSafeObject() },
  });
});

export const listOccurrences = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const [occurrences, total] = await Promise.all([
    ErrorOccurrence.find({ errorGroup: req.errorGroup._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-parsedFrames'),
    ErrorOccurrence.countDocuments({ errorGroup: req.errorGroup._id }),
  ]);

  return success(res, {
    message: 'Occurrences retrieved',
    data: { occurrences, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  });
});
