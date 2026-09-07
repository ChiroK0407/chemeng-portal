import { Router } from 'express';
import * as blogController from '../controllers/blog.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';

const router = Router();

// Public
router.get('/', blogController.getAll);
router.get('/:slug', blogController.getBySlug);

// Admin
router.get('/admin/all', requireAdminSession, blogController.getAllAdmin);
router.post('/', requireAdminSession, blogController.create);
router.put('/:id', requireAdminSession, blogController.update);
router.delete('/:id', requireAdminSession, blogController.remove);

export default router;
