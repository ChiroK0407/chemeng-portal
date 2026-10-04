import { Router } from 'express';
import * as organisationController from '../controllers/organisation.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';

const router = Router();

router.get('/', organisationController.getAll);
router.get('/:slug', organisationController.getBySlug);

router.get('/admin/all', requireAdminSession, organisationController.getAllAdmin);
router.post('/', requireAdminSession, organisationController.create);
router.put('/:id', requireAdminSession, organisationController.update);
router.delete('/:id', requireAdminSession, organisationController.remove);

export default router;
