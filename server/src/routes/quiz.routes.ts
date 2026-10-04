import { Router } from 'express';
import * as quizController from '../controllers/quiz.controller';
import { requireAdminSession } from '../middleware/adminAuth.middleware';
import { requireUserSession } from '../middleware/userAuth.middleware';
import { requireMemberProfile } from '../middleware/member.middleware';

const router = Router();

// Public — anyone can browse what's available.
router.get('/', quizController.listQuizzes);
router.get('/:id', quizController.getQuizDetail);
router.get('/:id/leaderboard', quizController.getLeaderboard);

// Attempt-taking — members only, AND their member profile must be
// complete (requireMemberProfile), not just their login (requireUserSession).
// This is the real enforcement point for "no new user can skip the join
// form" — a disabled button in the UI is just a nicety; this is what
// actually closes the door if someone calls the API directly.
router.post('/:id/attempts', requireUserSession, requireMemberProfile, quizController.startAttempt);
router.post('/attempts/:attemptId/answer', requireUserSession, requireMemberProfile, quizController.answerQuestion);

// Admin — same shared-password gate as every other admin panel route.
router.post('/', requireAdminSession, quizController.createQuiz);

export default router;
