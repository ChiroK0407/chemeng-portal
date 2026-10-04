-- Migration: add Google OAuth support to an ALREADY-EXISTING users table.
--
-- Run this (not auth_schema.sql) if you already applied an earlier
-- version of the schema to a real database -- i.e. if you've already
-- signed up/logged in a real user against this database. Safe to run
-- more than once: every statement below is guarded to be a no-op if
-- already applied.

ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'local';

-- Adding the CHECK constraint separately (rather than inline on the
-- column above) because ADD COLUMN ... CHECK syntax varies by Postgres
-- version; this form works everywhere and is idempotent via the
-- DO/EXCEPTION guard.
DO $$
BEGIN
  ALTER TABLE users
    ADD CONSTRAINT users_auth_provider_check
    CHECK (auth_provider IN ('local', 'google'));
EXCEPTION
  WHEN duplicate_object THEN NULL; -- constraint already exists, fine
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
