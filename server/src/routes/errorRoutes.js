import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireErrorAccess } from '../middleware/errorAccess.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { listErrorsQuerySchema, updateErrorSchema } from '../validators/errorValidators.js';
import { listErrors, getErrorDetail, updateError, listOccurrences } from '../controllers/errorController.js';

const router = Router();

router.use(requireAuth);

router.get('/', validateQuery(listErrorsQuerySchema), listErrors);
router.get('/:id', requireErrorAccess(), getErrorDetail);
router.patch('/:id', requireErrorAccess('owner', 'admin', 'developer'), validateBody(updateErrorSchema), updateError);
router.get('/:id/occurrences', requireErrorAccess(), listOccurrences);

export default router;
