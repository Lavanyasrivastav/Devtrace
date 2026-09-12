import { z } from 'zod';

const OBJECT_ID_RE = /^[0-9a-f]{24}$/i;

export const listErrorsQuerySchema = z.object({
  projectId: z.string().regex(OBJECT_ID_RE, 'Invalid projectId').optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  status: z.enum(['open', 'resolved', 'ignored']).optional(),
  environment: z.string().trim().min(1).optional(),
  service: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).max(200).optional(),
  sortBy: z.enum(['recent', 'frequent', 'critical', 'oldest']).optional().default('recent'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const updateErrorSchema = z
  .object({
    status: z.enum(['open', 'resolved', 'ignored']).optional(),
    severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  })
  .refine((data) => data.status || data.severity, {
    message: 'At least one of status or severity must be provided',
  });
