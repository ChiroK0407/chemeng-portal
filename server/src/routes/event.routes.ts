import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';

const router = Router();

router.get('/', eventController.getAll);
router.get('/:slug', eventController.getBySlug);

router.get('/admin/all', requireAdminSession, eventController.getAllAdmin);
router.post('/', requireAdminSession, eventController.create);
router.put('/:id', requireAdminSession, eventController.update);
router.delete('/:id', requireAdminSession, eventController.remove);

export default router;
