import { catchAsync } from '../utils/catchAsync.js';
import { AuthorizationError, NotFoundError } from '../utils/AppError.js';
import { Project } from '../models/Project.js';
import { ProjectMember } from '../models/ProjectMember.js';

// Loads the project from req.params.id (or req.params.projectId), loads the
// caller's membership, and rejects if their role isn't in allowedRoles.
// Attaches req.project and req.projectMember for downstream controllers.
export function requireProjectRole(...allowedRoles) {
  return catchAsync(async (req, res, next) => {
    const projectId = req.params.id || req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const membership = await ProjectMember.findOne({ project: projectId, user: req.user._id });
    if (!membership) {
      throw new AuthorizationError('You are not a member of this project');
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
      throw new AuthorizationError(`This action requires one of these roles: ${allowedRoles.join(', ')}`);
    }

    req.project = project;
    req.projectMember = membership;
    next();
  });
}
