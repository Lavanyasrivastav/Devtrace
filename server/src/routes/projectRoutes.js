import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validators/projectValidators.js';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  archiveProject,
  deleteProject,
  regenerateApiKey,
} from '../controllers/projectController.js';
import { listMembers, inviteMember, updateMemberRole, removeMember } from '../controllers/memberController.js';

const router = Router();

// Every route below requires a logged-in user.
router.use(requireAuth);

router.post('/', validateBody(createProjectSchema), createProject);
router.get('/', listProjects);

router.get('/:id', requireProjectRole(), getProject); // any role can view
router.patch('/:id', requireProjectRole('owner', 'admin'), validateBody(updateProjectSchema), updateProject);
router.patch('/:id/archive', requireProjectRole('owner', 'admin'), archiveProject);
router.delete('/:id', requireProjectRole('owner'), deleteProject);
router.post('/:id/regenerate-key', requireProjectRole('owner', 'admin'), regenerateApiKey);

router.get('/:id/members', requireProjectRole(), listMembers);
router.post('/:id/members', requireProjectRole('owner', 'admin'), validateBody(inviteMemberSchema), inviteMember);
router.patch(
  '/:id/members/:memberId',
  requireProjectRole('owner', 'admin'),
  validateBody(updateMemberRoleSchema),
  updateMemberRole
);
router.delete('/:id/members/:memberId', requireProjectRole('owner', 'admin'), removeMember);

export default router;
