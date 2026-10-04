-- Migration 003: Timed quizzes (4-option MCQ, auto-advancing per question).
--
-- Depends on: users(id) from auth_schema.sql — run that (and, if applicable,
-- auth_schema_google_migration.sql) BEFORE this file. Uses gen_random_uuid(),
-- which requires the pgcrypto extension that auth_schema.sql already enables;
-- re-declared here with IF NOT EXISTS in case this ever runs standalone.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Quizzes ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);

-- ── Questions (each with its own time limit) ────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id            UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text      TEXT NOT NULL,
  time_limit_seconds INTEGER NOT NULL CHECK (time_limit_seconds > 0),
  points             INTEGER NOT NULL DEFAULT 1 CHECK (points > 0),
  order_index        INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id, order_index);

-- ── Options — always exactly 4, enforced at the application layer ─
CREATE TABLE IF NOT EXISTS quiz_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0 CHECK (order_index BETWEEN 0 AND 3)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_options_question_order ON quiz_options(question_id, order_index);

-- ── Attempts — server tracks position so it (not the client) drives
--    progression through questions. user_id is nullable: Option A is
--    in effect, so an attempt may belong to a logged-in member
--    (user_id set, guest_name NULL) or an anonymous guest typing a
--    display name (user_id NULL, guest_name set). To move to
--    "members only", switch quiz.routes.ts from attachUserIfPresent to
--    requireUserSession — user_id will then always be set and
--    guest_name simply goes unused; no schema change required. ──
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id                      UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id                      UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_name                   TEXT,
  current_question_index      INTEGER NOT NULL DEFAULT 0,
  current_question_started_at TIMESTAMPTZ,
  score                        INTEGER NOT NULL DEFAULT 0,
  total_points                 INTEGER,
  status                       TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at                 TIMESTAMPTZ,
  CONSTRAINT chk_attempt_has_identity CHECK (user_id IS NOT NULL OR guest_name IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_score ON quiz_attempts(quiz_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);

-- ── Answers ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_answers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id         UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id        UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES quiz_options(id) ON DELETE SET NULL, -- NULL = timed out
  is_correct         BOOLEAN NOT NULL DEFAULT false,
  answered_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);
