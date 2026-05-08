-- Faz 19: Studio talep akışı
CREATE TABLE IF NOT EXISTS "studio_orders" (
  "id" serial PRIMARY KEY,
  "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" text NOT NULL DEFAULT 'pending',
  "customer_note" text,
  "admin_note" text,
  "assigned_to" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "studio_orders_project_id_idx" ON "studio_orders"("project_id");
CREATE INDEX IF NOT EXISTS "studio_orders_status_idx" ON "studio_orders"("status");
CREATE INDEX IF NOT EXISTS "studio_orders_user_id_idx" ON "studio_orders"("user_id");
