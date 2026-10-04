-- Migration 006: roll number for self-joined student members.
--
-- Depends on: migration_005_members_user_link.sql (members.user_id).
--
-- TEXT, not a numeric type — roll numbers can start with 0
-- (e.g. 002310301081), and any numeric column would silently strip
-- leading zeros. The regex CHECK enforces exactly 12 digits, nothing
-- else, at the database level — not just in the frontend form or the
-- controller, so this holds even if someone calls the API directly.
--
-- Required for students, forbidden for alumni in practice — but that
-- rule is enforced in member.controller.ts (join/updateMine), not with
-- a DB CHECK here: existing admin-created 'current'-category rows may
-- predate this column and have no roll_number, and a retroactive
-- NOT NULL-when-current constraint would break those rows on this
-- migration. The format CHECK below still holds unconditionally.
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS roll_number TEXT;

ALTER TABLE members
  ADD CONSTRAINT chk_roll_number_format
  CHECK (roll_number IS NULL OR roll_number ~ '^[0-9]{12}$');
