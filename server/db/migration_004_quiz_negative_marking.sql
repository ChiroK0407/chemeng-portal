-- Migration 004: negative marking toggle per quiz.
--
-- Depends on: migration_003_quizzes.sql (quizzes table).
--
-- Deliberately a single quiz-level flag, not a per-question value: a
-- wrong (non-timeout) answer deducts that question's own points value.
-- Skipped/timed-out questions are never penalized either way — see
-- answerQuestion in quiz.controller.ts.

ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS negative_marking BOOLEAN NOT NULL DEFAULT false;
