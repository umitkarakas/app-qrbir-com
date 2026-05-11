import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const blockCategoryEnum = pgEnum("block_category", [
  "common",
  "menu",
  "invitation",
  "bio_link",
]);

export const blockTypes = pgTable("block_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  blockType: text("block_type").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  category: blockCategoryEnum("category").notNull(),
  isPro: boolean("is_pro").notNull().default(false),
  allowedSiteTypes: text("allowed_site_types").array().notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
