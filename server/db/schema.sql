-- ChELL Portal — Stage 1 schema (raw SQL, no ORM)
-- Scope: only what's needed to launch — public content + single admin gate.
-- Deferred for later: full user accounts, PSU, events/RSVP, resources, bookmarks.

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ── Blogs ──────────────────────────────────────────────────────
CREATE TABLE blogs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  content        TEXT NOT NULL,
  cover_image    TEXT,
  author_name    TEXT NOT NULL,              -- plain text for now, no user table yet
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
  role_title     TEXT,                        -- e.g. "Process Engineer, IOCL" / "Final Year, ChemEng"
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

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  message        TEXT NOT NULL,
  link           TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_active ON notifications(is_active, created_at DESC);
