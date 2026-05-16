ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "template_id" integer;

DO $$ BEGIN
  ALTER TABLE "projects"
    ADD CONSTRAINT "projects_template_id_templates_id_fk"
    FOREIGN KEY ("template_id") REFERENCES "templates"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "idx_projects_template_id" ON "projects" ("template_id");
