CREATE TYPE "public"."block_category" AS ENUM('common', 'menu', 'invitation', 'bio_link');

CREATE TABLE IF NOT EXISTS "block_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "block_type" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "icon" text NOT NULL,
  "category" "block_category" NOT NULL,
  "is_pro" boolean DEFAULT false NOT NULL,
  "allowed_site_types" text[] NOT NULL,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "block_types_block_type_unique" UNIQUE("block_type")
);

CREATE INDEX IF NOT EXISTS "idx_block_types_category" ON "block_types" ("category");
CREATE INDEX IF NOT EXISTS "idx_block_types_enabled" ON "block_types" ("is_enabled");
CREATE INDEX IF NOT EXISTS "idx_block_types_sort_order" ON "block_types" ("sort_order");

CREATE TABLE IF NOT EXISTS "templates" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "product_type" "project_type" NOT NULL,
  "thumbnail_url" text,
  "theme_id" integer,
  "blocks" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "preview_info" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "is_premium" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "category" text,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);

CREATE INDEX IF NOT EXISTS "idx_templates_product_type" ON "templates" ("product_type");
CREATE INDEX IF NOT EXISTS "idx_templates_active" ON "templates" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_templates_theme_id" ON "templates" ("theme_id");

DO $$ BEGIN
  ALTER TABLE "templates"
    ADD CONSTRAINT "templates_theme_id_themes_id_fk"
    FOREIGN KEY ("theme_id") REFERENCES "themes"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "block_types" (
  "block_type",
  "name",
  "description",
  "icon",
  "category",
  "is_pro",
  "allowed_site_types",
  "sort_order"
) VALUES
  ('profile_card', 'Profil Kartı', 'Sayfanın en üstünde görünen profil alanıdır.', 'UserCircle', 'common', false, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 10),
  ('social_media', 'Sosyal Medya', 'Sosyal medya ve iletişim bağlantılarını ikonlarla gösterir.', 'Share2', 'common', false, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 20),
  ('text', 'Metin Bloğu', 'Başlık, paragraf ve açıklama metni ekler.', 'Type', 'common', false, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 30),
  ('image_gallery', 'Foto Galeri', 'Birden fazla görseli galeri formatında sunar.', 'Images', 'common', false, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 40),
  ('video', 'Video', 'YouTube, Vimeo veya doğrudan video bağlantısı ekler.', 'Video', 'common', false, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 50),
  ('link_button', 'Link Butonu', 'Özel bağlantıya yönlendiren çağrı aksiyon butonu ekler.', 'Link', 'common', false, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 60),
  ('map', 'Harita', 'Konumu harita üzerinde gösterir.', 'MapPin', 'common', false, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 70),
  ('divider', 'Ayırıcı', 'Sayfa bölümleri arasında görsel ayrım oluşturur.', 'Minus', 'common', false, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 80),
  ('vcard', 'vCard', 'İndirilebilir dijital kartvizit oluşturur.', 'Contact', 'common', true, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 90),
  ('pdf', 'PDF Görüntüleyici', 'PDF belgelerini sayfa içinde gösterir.', 'FileText', 'common', true, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 100),
  ('faq', 'SSS', 'Soru cevap içeriklerini akordeon formatında sunar.', 'HelpCircle', 'common', false, ARRAY['digital_menu', 'digital_invitation', 'bio_link'], 110),
  ('menu_item', 'Menü Öğesi', 'Fiyat ve açıklama içeren menü öğesi ekler.', 'UtensilsCrossed', 'menu', false, ARRAY['digital_menu'], 220),
  ('wifi_card', 'WiFi Kartı', 'WiFi ağ bilgilerini QR kod ve kopyalanabilir metinle sunar.', 'Wifi', 'menu', false, ARRAY['digital_menu'], 230),
  ('google_review', 'Google Yorum', 'Google İşletme yorum bağlantısına yönlendirir.', 'Star', 'menu', true, ARRAY['digital_menu'], 240),
  ('countdown', 'Geri Sayım Sayacı', 'Belirlenen tarihe kalan süreyi gösterir.', 'Clock', 'invitation', false, ARRAY['digital_invitation'], 310),
  ('rsvp_form', 'Katılım Bildirim Formu', 'Etkinlik katılım yanıtlarını toplar.', 'Calendar', 'invitation', false, ARRAY['digital_invitation'], 320),
  ('location_map', 'Konum Bilgisi', 'Etkinlik veya işletme konumunu gösterir.', 'MapPin', 'invitation', false, ARRAY['digital_invitation', 'digital_menu'], 330),
  ('skill_bars', 'Yetenek Çubukları', 'Beceri ve deneyimleri ilerleme çubuklarıyla gösterir.', 'BarChart', 'bio_link', false, ARRAY['bio_link'], 410),
  ('contact_form', 'İletişim Formu', 'Ziyaretçilerden mesaj toplar.', 'Mail', 'bio_link', false, ARRAY['bio_link'], 420),
  ('social_links', 'Sosyal Linkler', 'Sosyal medya bağlantılarını buton veya ikon formatında sunar.', 'Share2', 'bio_link', false, ARRAY['bio_link', 'digital_invitation', 'digital_menu'], 430)
ON CONFLICT ("block_type") DO NOTHING;
