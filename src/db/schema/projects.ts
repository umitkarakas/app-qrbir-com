import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const projectTypeEnum = pgEnum("project_type", [
  "restaurant_menu",
  "bio_link",
  "brand_bio",
  "google_review",
  "event_invitation",
  "campaign_link",
]);

export const subdomainTypeEnum = pgEnum("subdomain_type", [
  "m",
  "b",
  "r",
  "e",
  "go",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "info_missing",
  "studio_pending",
  "in_design",
  "preview_ready",
  "customer_revision",
  "approved",
  "payment_pending",
  "paid",
  "published",
  "paused",
  "expired",
  "cancelled",
]);

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectType: projectTypeEnum("project_type").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    subdomainType: subdomainTypeEnum("subdomain_type").notNull(),
    status: projectStatusEnum("status").notNull().default("draft"),
    themeId: integer("theme_id"),
    planId: integer("plan_id"),
    isFree: boolean("is_free").notNull().default(true),
    isPremium: boolean("is_premium").notNull().default(false),
    publishedUrl: text("published_url"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("projects_subdomain_slug_unique").on(t.subdomainType, t.slug)]
);

export const projectContents = pgTable("project_contents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  contentJson: jsonb("content_json").notNull().default({}),
  schemaVersion: integer("schema_version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
