import { Project } from '../models/Project.js';
import { hashApiKey } from '../services/apiKeyService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AuthenticationError } from '../utils/AppError.js';

// Ingestion requests come from third-party client apps embedding a project's
// API key, not from a logged-in browser session, so this is deliberately a
// separate auth path from requireAuth (JWT). Accepts the key either in the
// body (as documented) or in an X-API-Key header, for SDK convenience.
export const requireApiKey = catchAsync(async (req, res, next) => {
  const projectKey = req.body?.projectKey || req.headers['x-api-key'];

  if (!projectKey || typeof projectKey !== 'string') {
    throw new AuthenticationError('Missing project API key');
  }

  const project = await Project.findOne({ apiKeyHash: hashApiKey(projectKey) });
  if (!project) {
    throw new AuthenticationError('Invalid project API key');
  }
  if (project.isArchived) {
    throw new AuthenticationError('This project is archived and no longer accepting data');
  }

  req.project = project;
  next();
});
