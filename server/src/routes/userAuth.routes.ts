import { Router } from 'express';
import * as userAuthController from '../controllers/userAuth.controller';
import { requireUserSession } from '../middleware/userAuth.middleware';

const router = Router();

router.post('/signup', userAuthController.signup);
router.post('/login', userAuthController.login);
router.post('/logout', userAuthController.logout);
router.get('/me', requireUserSession, userAuthController.me);

router.post('/verify-email', userAuthController.verifyEmail);
router.post('/forgot-password', userAuthController.forgotPassword);
router.post('/reset-password', userAuthController.resetPassword);

// Google OAuth -- both GET, both hit by full browser navigation, not
// fetch/XHR (see the comments in userAuth.controller.ts for why).
router.get('/google', userAuthController.googleLogin);
router.get('/google/callback', userAuthController.googleCallback);

export default router;
