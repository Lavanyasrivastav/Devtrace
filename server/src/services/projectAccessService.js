import mongoose from 'mongoose';
import { ProjectMember } from '../models/ProjectMember.js';
import { AuthorizationError } from '../utils/AppError.js';

// If a specific projectId is requested, verify membership and scope to just
// that one project. Otherwise scope to every project the user belongs to,
// so the dashboard can show an aggregate view across all their projects.
export async function resolveProjectIds(userId, projectId) {
  if (projectId) {
    const membership = await ProjectMember.findOne({ user: userId, project: projectId });
    if (!membership) {
      throw new AuthorizationError('You do not have access to this project');
    }
    return [new mongoose.Types.ObjectId(projectId)];
  }

  const memberships = await ProjectMember.find({ user: userId }).select('project');
  return memberships.map((m) => m.project);
}
