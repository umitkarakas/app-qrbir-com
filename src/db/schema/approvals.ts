import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const approvalRequests = pgTable("approval_requests", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),        // UUID — public link'de kullanılır
  versionNumber: integer("version_number").notNull().default(1),
  status: text("status").notNull().default("pending"), // pending | approved | revision | expired
  customerNote: text("customer_note"),            // Müşterinin revizyon notu
  adminNote: text("admin_note"),                  // Admin'in iç notu
  expiresAt: timestamp("expires_at", { withTimezone: true }), // null = sınırsız
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
