import { Router } from 'express';
import * as adminAuthController from '../controllers/adminAuth.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';

const router = Router();

router.post('/login', adminAuthController.login);
router.post('/logout', adminAuthController.logout);
router.get('/check', requireAdminSession, adminAuthController.check);

export default router;
