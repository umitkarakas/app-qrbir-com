import { getSchemaModule } from "@/schemas";

export type MigrationResult = {
  data: unknown;
  schemaVersion: number;
  migrated: boolean;
};

/**
 * Lazy migration runner.
 * - DB'den okunan content_json + schema_version verilir.
 * - schema_version < CURRENT_VERSION ise zincirleme migrate eder.
 * - Sonuç CURRENT_VERSION schema'sı ile validate edilir.
 */
export function migrateContent(
  projectType: string,
  rawData: unknown,
  fromVersion: number
): MigrationResult {
  const mod = getSchemaModule(projectType);
  if (!mod) {
    throw new Error(`Bilinmeyen project_type: ${projectType}`);
  }

  let data = rawData;
  let version = fromVersion;
  let migrated = false;

  while (version < mod.CURRENT_VERSION) {
    const step = mod.migrations[version];
    if (!step) {
      throw new Error(
        `${projectType}: v${version} → v${version + 1} migration tanımlı değil`
      );
    }
    data = step(data);
    version += 1;
    migrated = true;
  }

  // Final validation (renderer her zaman doğrulanmış veri görmeli)
  const parsed = mod.schema.safeParse(data);
  if (!parsed.success) {
    // Migration sonrası invalid: default'a düş ama event log
    console.warn(
      `[content-migrator] ${projectType} v${version} validation failed:`,
      parsed.error.format()
    );
    return {
      data: mod.defaultContent,
      schemaVersion: mod.CURRENT_VERSION,
      migrated: true,
    };
  }

  return {
    data: parsed.data,
    schemaVersion: mod.CURRENT_VERSION,
    migrated,
  };
}
