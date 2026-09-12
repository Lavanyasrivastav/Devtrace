import { z } from 'zod';

const OBJECT_ID_RE = /^[0-9a-f]{24}$/i;

export const createMonitorSchema = z.object({
  projectId: z.string().regex(OBJECT_ID_RE, 'Invalid projectId'),
  name: z.string().trim().min(2).max(100),
  url: z.string().trim().url('Must be a valid URL'),
  method: z.enum(['GET', 'POST', 'HEAD', 'PUT']).optional().default('GET'),
  expectedStatus: z.coerce.number().int().min(100).max(599).optional().default(200),
  intervalSeconds: z.coerce.number().int().min(30).max(86400).optional().default(300),
});

export const updateMonitorSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  url: z.string().trim().url('Must be a valid URL').optional(),
  method: z.enum(['GET', 'POST', 'HEAD', 'PUT']).optional(),
  expectedStatus: z.coerce.number().int().min(100).max(599).optional(),
  intervalSeconds: z.coerce.number().int().min(30).max(86400).optional(),
  isActive: z.boolean().optional(),
});
