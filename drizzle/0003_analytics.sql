-- Faz 17: Analytics kolonları
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "view_count" integer NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "qr_count" integer NOT NULL DEFAULT 0;
