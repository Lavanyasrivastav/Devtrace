import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { projectScopeQuerySchema, frequencyQuerySchema, topErrorsQuerySchema } from '../validators/analyticsValidators.js';
import { getOverview, getFrequency, getBySeverity, getByProject, getTopErrors } from '../controllers/analyticsController.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', validateQuery(projectScopeQuerySchema), getOverview);
router.get('/frequency', validateQuery(frequencyQuerySchema), getFrequency);
router.get('/by-severity', validateQuery(projectScopeQuerySchema), getBySeverity);
router.get('/by-project', getByProject);
router.get('/top-errors', validateQuery(topErrorsQuerySchema), getTopErrors);

export default router;
