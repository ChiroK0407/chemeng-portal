-- Migration 002: PSUs, Events, Resources
-- Run this against your existing database — it only adds new tables,
-- nothing here touches blogs/opportunities/members/projects/notifications.

-- ── PSUs (Public Sector Undertakings — recruiter directory) ────
CREATE TABLE psus (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  full_name         TEXT,
  slug              TEXT NOT NULL UNIQUE,
  logo_url          TEXT,
  sector            TEXT,                          -- e.g. Maharatna, Navratna, Miniratna, Central PSU, State PSU
  description       TEXT,                            -- HTML allowed, rendered with dangerouslySetInnerHTML
  package_min_lpa   NUMERIC,
  package_max_lpa   NUMERIC,
  gate_cutoff       TEXT,
  bond_years        INTEGER,
  headquarters      TEXT,
  recruitment_mode  TEXT,
  eligible_branches TEXT[] DEFAULT '{}',
  website_url       TEXT,
  apply_url         TEXT,
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_psus_status ON psus(status);
CREATE INDEX idx_psus_sector ON psus(sector);

-- ── Events ──────────────────────────────────────────────────────
-- No RSVP/attendance tracking — that needs real user accounts to mean
-- anything, which this stage doesn't have. max_capacity is informational
-- only (admin can state it in the description) rather than enforced.
CREATE TABLE events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT,                              -- short description, shown in cards
  content        TEXT,                              -- long-form HTML, shown on detail page
  cover_image    TEXT,
  venue          TEXT,
  is_online      BOOLEAN NOT NULL DEFAULT false,
  meeting_url    TEXT,
  organizer_name TEXT,
  starts_at      TIMESTAMPTZ NOT NULL,
  ends_at        TIMESTAMPTZ,
  status         TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_starts_at ON events(starts_at);

-- ── Resources ─────────────────────────────────────────────────
CREATE TABLE resources (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL DEFAULT 'link' CHECK (type IN ('pdf', 'video', 'book', 'notes', 'link')),
  subject      TEXT,
  semester     INTEGER,
  url          TEXT NOT NULL,                       -- external link, or a hosted file URL
  uploader_name TEXT,
  downloads    INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_type ON resources(type);
