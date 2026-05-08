import { pgTable, serial, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";

/**
 * Yönetici ve sistem aksiyonlarını kaydeden audit log tablosu.
 * Her önemli durum değişikliği, onay gönderme, aktivasyon vb. buraya yazılır.
 */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),

  // Kim yaptı (admin/user). Kullanıcı silinse null kalır.
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),

  // Hangi proje üzerinde. Proje silinse null kalır.
  projectId: integer("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),

  // Ne yapıldı — "action.subject" formatında (örn: "project.activate", "approval.send")
  action: text("action").notNull(),

  // Ek bağlam (önceki/sonraki durum, ref_token, vs.)
  meta: jsonb("meta"),

  // İstek yapan IP adresi (isteğe bağlı)
  ip: text("ip"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
