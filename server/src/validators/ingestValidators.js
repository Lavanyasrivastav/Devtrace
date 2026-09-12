import { z } from 'zod';

export const ingestErrorSchema = z.object({
  projectKey: z.string().min(1, 'projectKey is required'),
  message: z.string().trim().min(1, 'message is required').max(2000),
  stackTrace: z.string().max(20000).optional().default(''),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional().default('error'),
  environment: z.string().trim().min(1).max(50).optional().default('production'),
  service: z.string().trim().max(100).optional().default('unknown'),
  timestamp: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  metadata: z.record(z.any()).optional().default({}),
});
