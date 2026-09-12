import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireMonitorAccess } from '../middleware/monitorAccess.js';
import { validateBody } from '../middleware/validate.js';
import { createMonitorSchema, updateMonitorSchema } from '../validators/monitorValidators.js';
import {
  createMonitor,
  listMonitors,
  getMonitor,
  updateMonitor,
  deleteMonitor,
  listMonitorResults,
} from '../controllers/monitorController.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(createMonitorSchema), createMonitor);
router.get('/', listMonitors);
router.get('/:id', requireMonitorAccess(), getMonitor);
router.patch('/:id', requireMonitorAccess(), validateBody(updateMonitorSchema), updateMonitor);
router.delete('/:id', requireMonitorAccess(), deleteMonitor);
router.get('/:id/results', requireMonitorAccess(), listMonitorResults);

export default router;
