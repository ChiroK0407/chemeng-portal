import { Router } from 'express';
import * as memberController from '../controllers/member.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';
import { requireUserSession } from '../middleware/userAuth.middleware';

const router = Router();

// Self-service — must be registered before /:id, or "/members/me" would
// be matched as a lookup for a member with id="me" instead.
router.get('/me', requireUserSession, memberController.getMine);
router.post('/join', requireUserSession, memberController.join);
router.put('/me', requireUserSession, memberController.updateMine);

router.get('/', memberController.getAll);
router.get('/:id', memberController.getById);

router.get('/admin/all', requireAdminSession, memberController.getAllAdmin);
router.post('/', requireAdminSession, memberController.create);
router.put('/:id', requireAdminSession, memberController.update);
router.delete('/:id', requireAdminSession, memberController.remove);

export default router;
