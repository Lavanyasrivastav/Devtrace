import { z } from 'zod';

const OBJECT_ID_RE = /^[0-9a-f]{24}$/i;

export const projectScopeQuerySchema = z.object({
  projectId: z.string().regex(OBJECT_ID_RE, 'Invalid projectId').optional(),
});

export const frequencyQuerySchema = projectScopeQuerySchema.extend({
  range: z.enum(['24h', '7d', '30d']).optional().default('7d'),
});

export const topErrorsQuerySchema = projectScopeQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
});
