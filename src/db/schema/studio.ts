import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";

export const studioOrderStatusEnum = [
  "pending",      // Yeni talep, admin görmedi
  "in_progress",  // Admin üzerinde çalışıyor
  "preview_ready",// Önizleme hazır, müşteri bekliyor
  "revision",     // Müşteri revizyon istedi
  "completed",    // İş tamamlandı, yayında
  "cancelled",    // İptal edildi
] as const;

export const studioOrders = pgTable("studio_orders", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending | in_progress | preview_ready | revision | completed | cancelled
  customerNote: text("customer_note"),  // Müşterinin isteği/notları
  adminNote: text("admin_note"),        // Admin'in iç notu
  assignedTo: text("assigned_to"),      // Hangi studio kullanıcısına atandı
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
