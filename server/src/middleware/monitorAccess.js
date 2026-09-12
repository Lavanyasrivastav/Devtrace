import { Monitor } from '../models/Monitor.js';
import { ProjectMember } from '../models/ProjectMember.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AuthorizationError, NotFoundError } from '../utils/AppError.js';

export function requireMonitorAccess(...allowedRoles) {
  return catchAsync(async (req, res, next) => {
    const monitor = await Monitor.findById(req.params.id);
    if (!monitor) {
      throw new NotFoundError('Monitor not found');
    }

    const membership = await ProjectMember.findOne({ project: monitor.project, user: req.user._id });
    if (!membership) {
      throw new AuthorizationError('You do not have access to this monitor');
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
      throw new AuthorizationError(`This action requires one of these roles: ${allowedRoles.join(', ')}`);
    }

    req.monitor = monitor;
    req.projectMember = membership;
    next();
  });
}
