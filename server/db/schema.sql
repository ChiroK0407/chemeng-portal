-- ChELL Portal — full schema (raw SQL, no ORM)
-- For a FRESH database only. If your database already has the first five
-- tables, use migration_002_psu_events_resources.sql instead — running
-- this whole file again will fail on "relation already exists".

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ── Blogs ──────────────────────────────────────────────────────
CREATE TABLE blogs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  content        TEXT NOT NULL,
  cover_image    TEXT,
  author_name    TEXT NOT NULL,
  tags           TEXT[] DEFAULT '{}',
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  read_time_min  INTEGER DEFAULT 1,
  views          INTEGER NOT NULL DEFAULT 0,
  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_published_at ON blogs(published_at DESC);

-- ── Opportunities ─────────────────────────────────────────────
CREATE TABLE opportunities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  company        TEXT NOT NULL,
  description    TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('internship', 'job', 'research', 'other')),
  location       TEXT,
  is_remote      BOOLEAN NOT NULL DEFAULT false,
  stipend_max    NUMERIC,
  apply_url      TEXT,
  deadline       TIMESTAMPTZ,
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_opportunities_status ON opportunities(status);

-- ── Members (notable persons — current engineers / alumni) ─────
CREATE TABLE members (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT NOT NULL,
  role_title     TEXT,
  category       TEXT NOT NULL DEFAULT 'current' CHECK (category IN ('current', 'alumni')),
  branch         TEXT,
  bio            TEXT,
  photo_url      TEXT,
  linkedin_url   TEXT,
  is_featured    BOOLEAN NOT NULL DEFAULT false,
  status         TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_members_status ON members(status);

-- ── Projects (recent work) ───────────────────────────────────
CREATE TABLE projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT NOT NULL,
  cover_image    TEXT,
  author_name    TEXT NOT NULL,
  tech_stack     TEXT[] DEFAULT '{}',
  project_url    TEXT,
  status         TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_projects_status ON projects(status);

-- ── Notifications (backend only at this stage — not wired to any
--    public UI, since real per-user targeting needs the login system
--    this project has deferred) ────────────────────────────────
CREATE TABLE notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  message        TEXT NOT NULL,
  link           TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_active ON notifications(is_active, created_at DESC);

-- ── PSUs (Public Sector Undertakings — recruiter directory) ────
CREATE TABLE psus (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  full_name         TEXT,
  slug              TEXT NOT NULL UNIQUE,
  logo_url          TEXT,
  sector            TEXT,
  description       TEXT,
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
CREATE TABLE events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT,
  content        TEXT,
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
  url          TEXT NOT NULL,
  uploader_name TEXT,
  downloads    INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_type ON resources(type);
