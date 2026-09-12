import { Monitor } from '../models/Monitor.js';
import { MonitorResult } from '../models/MonitorResult.js';
import { ProjectMember } from '../models/ProjectMember.js';
import { resolveProjectIds } from '../services/projectAccessService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { success } from '../utils/apiResponse.js';
import { AuthorizationError, NotFoundError } from '../utils/AppError.js';

export const createMonitor = catchAsync(async (req, res) => {
  const { projectId, name, url, method, expectedStatus, intervalSeconds } = req.body;

  const membership = await ProjectMember.findOne({ project: projectId, user: req.user._id });
  if (!membership) throw new NotFoundError('Project not found');
  if (!['owner', 'admin'].includes(membership.role)) {
    throw new AuthorizationError('Only owners and admins can create monitors');
  }

  const monitor = await Monitor.create({
    project: projectId,
    name,
    url,
    method,
    expectedStatus,
    intervalSeconds,
    nextCheckAt: new Date(), // check immediately on creation
  });

  return success(res, { statusCode: 201, message: 'Monitor created', data: { monitor: monitor.toSafeObject() } });
});

export const listMonitors = catchAsync(async (req, res) => {
  const { projectId } = req.query;
  const projectIds = await resolveProjectIds(req.user._id, projectId);

  const monitors = await Monitor.find({ project: { $in: projectIds } }).sort({ createdAt: -1 });

  return success(res, { message: 'Monitors retrieved', data: { monitors: monitors.map((m) => m.toSafeObject()) } });
});

export const getMonitor = catchAsync(async (req, res) => {
  return success(res, { message: 'Monitor retrieved', data: { monitor: req.monitor.toSafeObject() } });
});

export const updateMonitor = catchAsync(async (req, res) => {
  if (!['owner', 'admin'].includes(req.projectMember.role)) {
    throw new AuthorizationError('Only owners and admins can update monitors');
  }
  Object.assign(req.monitor, req.body);
  await req.monitor.save();

  return success(res, { message: 'Monitor updated', data: { monitor: req.monitor.toSafeObject() } });
});

export const deleteMonitor = catchAsync(async (req, res) => {
  if (!['owner', 'admin'].includes(req.projectMember.role)) {
    throw new AuthorizationError('Only owners and admins can delete monitors');
  }
  await Monitor.findByIdAndDelete(req.monitor._id);
  await MonitorResult.deleteMany({ monitor: req.monitor._id });

  return success(res, { message: 'Monitor deleted' });
});

export const listMonitorResults = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

  const results = await MonitorResult.find({ monitor: req.monitor._id }).sort({ checkedAt: -1 }).limit(limit);

  const upCount = results.filter((r) => r.isUp).length;
  const uptimePercentage = results.length ? Math.round((upCount / results.length) * 10000) / 100 : null;

  return success(res, {
    message: 'Monitor results retrieved',
    data: { results, uptimePercentage },
  });
});
