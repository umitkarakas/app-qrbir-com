-- Faz 2: projects ve project_contents tablolari

CREATE TYPE project_type AS ENUM (
  'restaurant_menu',
  'bio_link',
  'brand_bio',
  'google_review',
  'event_invitation',
  'campaign_link'
);

CREATE TYPE subdomain_type AS ENUM ('m', 'b', 'r', 'e', 'go');

CREATE TYPE project_status AS ENUM (
  'draft',
  'info_missing',
  'studio_pending',
  'in_design',
  'preview_ready',
  'customer_revision',
  'approved',
  'payment_pending',
  'paid',
  'published',
  'paused',
  'expired',
  'cancelled'
);

CREATE TABLE projects (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_type project_type NOT NULL,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL,
  subdomain_type subdomain_type NOT NULL,
  status      project_status NOT NULL DEFAULT 'draft',
  theme_id    INTEGER,
  plan_id     INTEGER,
  is_free     BOOLEAN NOT NULL DEFAULT TRUE,
  is_premium  BOOLEAN NOT NULL DEFAULT FALSE,
  published_url TEXT,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_subdomain_slug_unique UNIQUE (subdomain_type, slug)
);

CREATE TABLE project_contents (
  id             SERIAL PRIMARY KEY,
  project_id     INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content_json   JSONB NOT NULL DEFAULT '{}',
  schema_version INTEGER NOT NULL DEFAULT 1,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
