import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';

const router = Router();

router.get('/', notificationController.getAll);

router.get('/admin/all', requireAdminSession, notificationController.getAllAdmin);
router.post('/', requireAdminSession, notificationController.create);
router.put('/:id', requireAdminSession, notificationController.update);
router.delete('/:id', requireAdminSession, notificationController.remove);

export default router;
