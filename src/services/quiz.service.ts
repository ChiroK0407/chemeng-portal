import api from '../lib/axios';
import type { QuizDraft, QuizDetail, StartAttemptResponse, AnswerResponse, LeaderboardEntry } from '../types/quiz.types';

export const quizService = {
  list: () => api.get('/quizzes').then((r) => r.data),
  detail: (quizId: string) => api.get<QuizDetail>(`/quizzes/${quizId}`).then((r) => r.data),
  create: (draft: QuizDraft) => api.post('/quizzes', draft).then((r) => r.data),
  // Members only — the request relies on the session cookie the browser
  // already sends; the route rejects with 401 if there isn't one.
  startAttempt: (quizId: string) =>
    api.post<StartAttemptResponse>(`/quizzes/${quizId}/attempts`).then((r) => r.data),
  answer: (attemptId: string, questionId: string, selectedOptionId: string | null) =>
    api
      .post<AnswerResponse>(`/quizzes/attempts/${attemptId}/answer`, {
        question_id: questionId,
        selected_option_id: selectedOptionId,
      })
      .then((r) => r.data),
  leaderboard: (quizId: string) =>
    api.get<LeaderboardEntry[]>(`/quizzes/${quizId}/leaderboard`).then((r) => r.data),
};
