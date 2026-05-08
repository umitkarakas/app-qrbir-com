-- Faz 9: WooCommerce entegrasyonu

-- Kullanıcı WooCommerce'e yönlendirilmeden önce oluşturulan geçici sipariş kaydı
CREATE TABLE IF NOT EXISTS "pending_orders" (
  "id" serial PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "order_type" text NOT NULL,
  "ref_token" text NOT NULL UNIQUE,
  "wc_product_id" text,
  "status" text NOT NULL DEFAULT 'pending',
  "expires_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "pending_orders_user_id_idx" ON "pending_orders"("user_id");
CREATE INDEX IF NOT EXISTS "pending_orders_project_id_idx" ON "pending_orders"("project_id");
CREATE INDEX IF NOT EXISTS "pending_orders_ref_token_idx" ON "pending_orders"("ref_token");
CREATE INDEX IF NOT EXISTS "pending_orders_status_idx" ON "pending_orders"("status");

-- WooCommerce webhook ile gelen tamamlanmış siparişler
CREATE TABLE IF NOT EXISTS "woocommerce_orders" (
  "id" serial PRIMARY KEY,
  "woocommerce_order_id" integer NOT NULL UNIQUE,
  "user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  "project_id" integer REFERENCES "projects"("id") ON DELETE SET NULL,
  "pending_order_id" integer REFERENCES "pending_orders"("id") ON DELETE SET NULL,
  "order_type" text,
  "payment_status" text NOT NULL DEFAULT 'pending',
  "total" numeric(10,2),
  "currency" text DEFAULT 'TRY',
  "raw_payload_json" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "woocommerce_orders_wc_order_id_idx" ON "woocommerce_orders"("woocommerce_order_id");
CREATE INDEX IF NOT EXISTS "woocommerce_orders_project_id_idx" ON "woocommerce_orders"("project_id");
CREATE INDEX IF NOT EXISTS "woocommerce_orders_payment_status_idx" ON "woocommerce_orders"("payment_status");
