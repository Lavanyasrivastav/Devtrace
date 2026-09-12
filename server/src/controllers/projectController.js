import { Project } from '../models/Project.js';
import { ProjectMember } from '../models/ProjectMember.js';
import { catchAsync } from '../utils/catchAsync.js';
import { success } from '../utils/apiResponse.js';
import { AuthorizationError } from '../utils/AppError.js';
import { generateApiKey } from '../services/apiKeyService.js';
import { bumpProjectCacheVersion } from '../services/cacheService.js';

export const createProject = catchAsync(async (req, res) => {
  const { name, description, environment } = req.body;
  const { fullKey, prefix, hash } = generateApiKey();

  const project = await Project.create({
    name,
    description,
    environment,
    owner: req.user._id,
    apiKeyHash: hash,
    apiKeyPrefix: prefix,
  });

  await ProjectMember.create({
    project: project._id,
    user: req.user._id,
    role: 'owner',
  });

  // The full plaintext key is only ever returned once, at creation time —
  // after this, only the prefix is retrievable. The user must copy it now.
  return success(res, {
    statusCode: 201,
    message: 'Project created',
    data: { project: project.toSafeObject(), apiKey: fullKey },
  });
});

export const listProjects = catchAsync(async (req, res) => {
  const memberships = await ProjectMember.find({ user: req.user._id }).select('project role');
  const projectIds = memberships.map((m) => m.project);

  const projects = await Project.find({ _id: { $in: projectIds } }).sort({ createdAt: -1 });

  const roleByProjectId = Object.fromEntries(memberships.map((m) => [m.project.toString(), m.role]));

  return success(res, {
    message: 'Projects retrieved',
    data: {
      projects: projects.map((p) => ({ ...p.toSafeObject(), myRole: roleByProjectId[p._id.toString()] })),
    },
  });
});

export const getProject = catchAsync(async (req, res) => {
  // req.project and req.projectMember are already attached by requireProjectRole
  return success(res, {
    message: 'Project retrieved',
    data: { project: req.project.toSafeObject(), myRole: req.projectMember.role },
  });
});

export const updateProject = catchAsync(async (req, res) => {
  Object.assign(req.project, req.body);
  await req.project.save();
  await bumpProjectCacheVersion(req.project._id);

  return success(res, {
    message: 'Project updated',
    data: { project: req.project.toSafeObject() },
  });
});

export const archiveProject = catchAsync(async (req, res) => {
  req.project.isArchived = !req.project.isArchived;
  await req.project.save();
  await bumpProjectCacheVersion(req.project._id);

  return success(res, {
    message: req.project.isArchived ? 'Project archived' : 'Project unarchived',
    data: { project: req.project.toSafeObject() },
  });
});

export const deleteProject = catchAsync(async (req, res) => {
  // Only the true owner can delete, even though admins can update/archive.
  if (req.projectMember.role !== 'owner') {
    throw new AuthorizationError('Only the project owner can delete this project');
  }

  await Project.findByIdAndDelete(req.project._id);
  await ProjectMember.deleteMany({ project: req.project._id });

  return success(res, { message: 'Project deleted' });
});

export const regenerateApiKey = catchAsync(async (req, res) => {
  const { fullKey, prefix, hash } = generateApiKey();
  req.project.apiKeyHash = hash;
  req.project.apiKeyPrefix = prefix;
  await req.project.save();

  return success(res, {
    message: 'API key regenerated. Update your SDK configuration — the old key is now invalid.',
    data: { project: req.project.toSafeObject(), apiKey: fullKey },
  });
});
