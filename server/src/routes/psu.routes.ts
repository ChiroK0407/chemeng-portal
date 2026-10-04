import { Router } from 'express';
import * as psuController from '../controllers/psu.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';

const router = Router();

router.get('/', psuController.getAll);
router.get('/:slug', psuController.getBySlug);

router.get('/admin/all', requireAdminSession, psuController.getAllAdmin);
router.post('/', requireAdminSession, psuController.create);
router.put('/:id', requireAdminSession, psuController.update);
router.delete('/:id', requireAdminSession, psuController.remove);

export default router;
