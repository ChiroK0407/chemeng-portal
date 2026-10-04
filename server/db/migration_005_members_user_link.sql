-- Migration 005: link members to users (self-service "Join" flow)
--
-- A member row can now optionally be owned by a signed-in user. Existing
-- admin-created member rows keep user_id NULL — they were never claimed
-- by anyone, and that's fine, they still display normally. UNIQUE ensures
-- one user can have at most one member card, so re-clicking "Join" can't
-- create duplicates. ON DELETE SET NULL rather than CASCADE: if a user
-- account is ever deleted, their card doesn't vanish — it just reverts to
-- looking like an admin-added entry, which is the safer default for a
-- small community site (a person's bio staying up is not a data leak).
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
