import { Router } from 'express';
import { requireApiKey } from '../middleware/apiKeyAuth.js';
import { ingestLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import { ingestErrorSchema } from '../validators/ingestValidators.js';
import { ingestError } from '../controllers/ingestController.js';

const router = Router();

// Order matters: requireApiKey must run first so ingestLimiter can key its
// rate limit by project ID rather than IP.
router.post('/error', requireApiKey, ingestLimiter, validateBody(ingestErrorSchema), ingestError);

export default router;
