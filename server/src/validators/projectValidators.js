import { z } from 'zod';
import { ENVIRONMENT_VALUES } from '../models/Project.js';
import { PROJECT_ROLES } from '../models/ProjectMember.js';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(100),
  description: z.string().trim().max(500).optional().default(''),
  environment: z.enum(ENVIRONMENT_VALUES).optional().default('development'),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  environment: z.enum(ENVIRONMENT_VALUES).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  role: z.enum(PROJECT_ROLES.filter((r) => r !== 'owner')), // can't invite someone directly as owner
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(PROJECT_ROLES.filter((r) => r !== 'owner')),
});
