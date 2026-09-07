import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';

const router = Router();

router.get('/', projectController.getAll);
router.get('/:slug', projectController.getBySlug);

router.get('/admin/all', requireAdminSession, projectController.getAllAdmin);
router.post('/', requireAdminSession, projectController.create);
router.put('/:id', requireAdminSession, projectController.update);
router.delete('/:id', requireAdminSession, projectController.remove);

export default router;
