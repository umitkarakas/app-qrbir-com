-- Faz 3: themes tablosu

CREATE TYPE theme_status AS ENUM ('draft', 'active', 'archived');

CREATE TABLE themes (
  id                 SERIAL PRIMARY KEY,
  product_type       project_type NOT NULL,
  name               TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  description        TEXT,
  preview_image_url  TEXT,
  is_free            BOOLEAN NOT NULL DEFAULT TRUE,
  is_premium         BOOLEAN NOT NULL DEFAULT FALSE,
  status             theme_status NOT NULL DEFAULT 'active',
  theme_config_json  JSONB NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- projects.theme_id artik foreign key
ALTER TABLE projects
  ADD CONSTRAINT projects_theme_id_fkey
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL;

-- Yetki
GRANT ALL PRIVILEGES ON themes TO qrbir_app_user;
GRANT ALL PRIVILEGES ON themes_id_seq TO qrbir_app_user;

-- Seed: baslangic temalari
INSERT INTO themes (product_type, name, slug, description, is_free, is_premium, theme_config_json) VALUES
  ('restaurant_menu', 'Klasik Beyaz', 'klasik-beyaz', 'Sade, okunakli klasik menu temasi', TRUE, FALSE,
   '{"colors":{"bg":"#ffffff","fg":"#1f2937","accent":"#0f766e"},"font":"sans","layout":"list"}'),
  ('restaurant_menu', 'Modern Koyu', 'modern-koyu', 'Sik, koyu modern restoran temasi', TRUE, FALSE,
   '{"colors":{"bg":"#0f172a","fg":"#f8fafc","accent":"#fb923c"},"font":"serif","layout":"grid"}'),
  ('restaurant_menu', 'Premium Altin', 'premium-altin', 'Lux altin detayli premium tema', FALSE, TRUE,
   '{"colors":{"bg":"#1c1917","fg":"#fef3c7","accent":"#d4af37"},"font":"serif","layout":"editorial"}'),

  ('bio_link', 'Minimal', 'minimal', 'Sade ve minimal bio link temasi', TRUE, FALSE,
   '{"colors":{"bg":"#ffffff","fg":"#111827","accent":"#3b82f6"},"font":"sans","layout":"stack"}'),
  ('bio_link', 'Gradyan Mavi', 'gradyan-mavi', 'Yumusak gradyan bio link temasi', TRUE, FALSE,
   '{"colors":{"bg":"linear-gradient(135deg,#3b82f6,#8b5cf6)","fg":"#ffffff","accent":"#fbbf24"},"font":"sans","layout":"stack"}'),
  ('bio_link', 'Premium Cam', 'premium-cam', 'Glassmorphism efektli premium tema', FALSE, TRUE,
   '{"colors":{"bg":"#0c0a1f","fg":"#ffffff","accent":"#06b6d4"},"font":"sans","layout":"glass","effect":"blur"}'),

  ('brand_bio', 'Kurumsal', 'kurumsal', 'Profesyonel marka tanitim temasi', TRUE, FALSE,
   '{"colors":{"bg":"#f9fafb","fg":"#111827","accent":"#1f2937"},"font":"sans","layout":"corporate"}'),

  ('google_review', 'Yildiz', 'yildiz', 'Yorum yonlendirme temasi', TRUE, FALSE,
   '{"colors":{"bg":"#fffbeb","fg":"#451a03","accent":"#f59e0b"},"font":"sans","layout":"cta"}'),

  ('event_invitation', 'Davet', 'davet', 'Klasik etkinlik davetiye temasi', TRUE, FALSE,
   '{"colors":{"bg":"#fdf2f8","fg":"#831843","accent":"#ec4899"},"font":"serif","layout":"invitation"}'),

  ('campaign_link', 'Kampanya', 'kampanya', 'Promosyon kampanya temasi', TRUE, FALSE,
   '{"colors":{"bg":"#fef2f2","fg":"#7f1d1d","accent":"#dc2626"},"font":"sans","layout":"hero"}');
