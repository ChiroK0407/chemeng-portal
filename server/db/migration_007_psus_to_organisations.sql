-- Migration 007: PSUs -> Organisations.
--
-- Generalizes the PSU directory to cover both government PSUs and
-- corporate employers. Table rename preserves existing rows (confirmed
-- acceptable to lose/re-upload if anything goes wrong, but a plain
-- RENAME doesn't touch data at all, so nothing is actually at risk here).
--
-- Old index names (idx_psus_*, from migration_002) are left as-is --
-- Postgres doesn't auto-rename them with the table, and renaming them
-- too is cosmetic only, not worth the churn.

ALTER TABLE psus RENAME TO organisations;

-- sector held PSU-specific values (Maharatna/Navratna/...) that make no
-- sense for a private company. org_type replaces it with a fixed set
-- covering both government and corporate employers.
ALTER TABLE organisations RENAME COLUMN sector TO org_type;

ALTER TABLE organisations
  ADD CONSTRAINT chk_org_type CHECK (org_type IS NULL OR org_type IN (
    'Government PSU', 'Private Company', 'MNC', 'Startup'
  ));

-- Salary is deliberately never disclosed, government or corporate alike.
ALTER TABLE organisations DROP COLUMN IF EXISTS package_min_lpa;
ALTER TABLE organisations DROP COLUMN IF EXISTS package_max_lpa;

-- Replaces the removed salary figures with what actually matters to a
-- chemical engineer evaluating an employer: role types, growth path,
-- work culture. Free text / HTML, same treatment as `description`.
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS engineer_notes TEXT;
