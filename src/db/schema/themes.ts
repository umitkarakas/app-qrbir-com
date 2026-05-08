import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { projectTypeEnum } from "./projects";

export const themeStatusEnum = pgEnum("theme_status", [
  "draft",
  "active",
  "archived",
]);

export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  productType: projectTypeEnum("product_type").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  previewImageUrl: text("preview_image_url"),
  isFree: boolean("is_free").notNull().default(true),
  isPremium: boolean("is_premium").notNull().default(false),
  status: themeStatusEnum("status").notNull().default("active"),
  themeConfigJson: jsonb("theme_config_json").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
