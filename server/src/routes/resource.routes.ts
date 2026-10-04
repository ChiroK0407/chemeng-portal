import { Router } from 'express';
import * as resourceController from '../controllers/resource.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';

const router = Router();

router.get('/', resourceController.getAll);
router.post('/:id/click', resourceController.trackClick);

router.get('/admin/all', requireAdminSession, resourceController.getAllAdmin);
router.post('/', requireAdminSession, resourceController.create);
router.put('/:id', requireAdminSession, resourceController.update);
router.delete('/:id', requireAdminSession, resourceController.remove);

export default router;
