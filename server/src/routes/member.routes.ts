import { Router } from 'express';
import * as memberController from '../controllers/member.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';

const router = Router();

router.get('/', memberController.getAll);
router.get('/:id', memberController.getById);

router.get('/admin/all', requireAdminSession, memberController.getAllAdmin);
router.post('/', requireAdminSession, memberController.create);
router.put('/:id', requireAdminSession, memberController.update);
router.delete('/:id', requireAdminSession, memberController.remove);

export default router;
