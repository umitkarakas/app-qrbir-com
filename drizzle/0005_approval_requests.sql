-- Faz 20: Onay akışı
CREATE TABLE IF NOT EXISTS "approval_requests" (
  "id" serial PRIMARY KEY,
  "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "version_number" integer NOT NULL DEFAULT 1,
  "status" text NOT NULL DEFAULT 'pending',
  "customer_note" text,
  "admin_note" text,
  "expires_at" timestamptz,
  "responded_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "approval_requests_project_id_idx" ON "approval_requests"("project_id");
CREATE INDEX IF NOT EXISTS "approval_requests_token_idx" ON "approval_requests"("token");
CREATE INDEX IF NOT EXISTS "approval_requests_status_idx" ON "approval_requests"("status");
