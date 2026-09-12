import { ErrorGroup } from '../models/ErrorGroup.js';
import { ProjectMember } from '../models/ProjectMember.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AuthorizationError, NotFoundError } from '../utils/AppError.js';

// Unlike requireProjectRole (which reads a project id straight from the URL),
// this loads the project id off the ErrorGroup itself first, since error
// routes are addressed by error id, not project id.
export function requireErrorAccess(...allowedRoles) {
  return catchAsync(async (req, res, next) => {
    const errorGroup = await ErrorGroup.findById(req.params.id);
    if (!errorGroup) {
      throw new NotFoundError('Error not found');
    }

    const membership = await ProjectMember.findOne({ project: errorGroup.project, user: req.user._id });
    if (!membership) {
      throw new AuthorizationError('You do not have access to this error');
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
      throw new AuthorizationError(`This action requires one of these roles: ${allowedRoles.join(', ')}`);
    }

    req.errorGroup = errorGroup;
    req.projectMember = membership;
    next();
  });
}
