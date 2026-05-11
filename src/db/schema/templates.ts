import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { projectTypeEnum } from "./projects";
import { themes } from "./themes";

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  productType: projectTypeEnum("product_type").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  themeId: integer("theme_id").references(() => themes.id, {
    onDelete: "set null",
  }),
  blocks: jsonb("blocks").notNull().default([]),
  settings: jsonb("settings").notNull().default({}),
  metadata: jsonb("metadata").notNull().default({}),
  previewInfo: jsonb("preview_info").notNull().default({}),
  isPremium: boolean("is_premium").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  category: text("category"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
