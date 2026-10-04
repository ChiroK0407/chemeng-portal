-- Shared user accounts — Stage 1 (raw SQL, no ORM)
--
-- Design intent: this ONE `users` table is meant to be shared across every
-- app on the same Neon database (ChemEng Portal, ChELL Portal, and any
-- future app), so a person creates exactly one account and it works
-- everywhere. Nothing here is app-specific — no chemeng-portal-only or
-- chell-portal-only columns. If an app needs its own per-user data later
-- (e.g. a ChELL-specific profile field), that belongs in a separate table
-- with a user_id foreign key, not bolted onto this one.
--
-- For cross-app single sign-on to actually work once both apps are wired
-- up, THREE things must be identical across every app's deployment:
--   1. This same Neon database (or at minimum this same `users` table)
--   2. The same value in USER_JWT_SECRET across every app's environment
--   3. The session cookie set with the same Domain (e.g. ".yourdomain.com")
-- Get any one of those wrong and "log in once, both apps see it" silently
-- breaks — usually as "it works on the API but the other app still shows
-- logged out", which is a cookie-domain mismatch, not a code bug.

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid(), already
                                            -- enabled if ChELL's schema ran
                                            -- against this same database

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,              -- bcrypt hash, never plaintext
  full_name      TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  is_verified    BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Email verification tokens ─────────────────────────────────
-- One row per outstanding verification link. The token itself is emailed
-- to the user; only its SHA-256 hash is stored here, so a leaked database
-- backup doesn't hand out working verification links.
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash     TEXT NOT NULL UNIQUE,
  expires_at     TIMESTAMPTZ NOT NULL,
  used_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_evt_user ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_evt_token_hash ON email_verification_tokens(token_hash);

-- ── Password reset tokens ─────────────────────────────────────
-- Same hashed-token pattern as above, kept as a separate table (rather
-- than reusing email_verification_tokens with a "type" column) so a
-- pending password reset can never accidentally verify an email, or vice
-- versa, even if the lookup query had a bug.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash     TEXT NOT NULL UNIQUE,
  expires_at     TIMESTAMPTZ NOT NULL,
  used_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prt_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens(token_hash);
