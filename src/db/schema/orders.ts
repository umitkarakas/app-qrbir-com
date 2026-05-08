import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";

// Kullanıcı WooCommerce'e yönlendirilmeden önce oluşturulan geçici kayıt
export const pendingOrders = pgTable("pending_orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  orderType: text("order_type").notNull(), // "digital_plan" | "studio_service" | "physical_product"
  refToken: text("ref_token").notNull().unique(), // UUID, WooCommerce'e URL param olarak taşınır
  wcProductId: text("wc_product_id"), // WooCommerce'e yönlendirilecek ürün ID
  status: text("status").notNull().default("pending"), // "pending" | "completed" | "expired" | "cancelled"
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// WooCommerce webhook ile gelen tamamlanmış siparişler
export const woocommerceOrders = pgTable("woocommerce_orders", {
  id: serial("id").primaryKey(),
  woocommerceOrderId: integer("woocommerce_order_id").notNull().unique(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  pendingOrderId: integer("pending_order_id").references(() => pendingOrders.id, { onDelete: "set null" }),
  orderType: text("order_type"), // "digital_plan" | "studio_service" | "physical_product"
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending" | "completed" | "refunded" | "failed"
  total: numeric("total", { precision: 10, scale: 2 }),
  currency: text("currency").default("TRY"),
  rawPayloadJson: jsonb("raw_payload_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
