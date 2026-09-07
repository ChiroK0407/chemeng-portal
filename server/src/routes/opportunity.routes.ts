import { Router } from 'express';
import * as opportunityController from '../controllers/opportunity.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';

const router = Router();

router.get('/', opportunityController.getAll);
router.get('/:id', opportunityController.getById);

router.get('/admin/all', requireAdminSession, opportunityController.getAllAdmin);
router.post('/', requireAdminSession, opportunityController.create);
router.put('/:id', requireAdminSession, opportunityController.update);
router.delete('/:id', requireAdminSession, opportunityController.remove);

export default router;
