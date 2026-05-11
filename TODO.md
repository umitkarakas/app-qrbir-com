# QRbir TODO

Bu liste `ARCHITECTURE.md` dosyasındaki mevcut mimari kararlar, bilinen borçlar ve iki editör hedefi baz alınarak hazırlanmıştır. Sıralama, önce proje bütünlüğünü ve güvenliği sabitleyip sonra büyük editör işlerine girecek şekilde yapılmıştır.

## Faz 0: Dokümantasyon ve Kurulum Zemini

- [ ] `README.md` dosyasını gerçek proje durumuna göre güncelle.
  - Amaç, varsayılan Next.js metnini kaldırıp QRbir'in ne olduğunu, nasıl çalıştırıldığını ve temel akışlarını anlatmak.
  - Kapsam: install, dev, build, lint, db generate/migrate/studio, local URL.

- [ ] `.env.example` dosyasını doğrula ve güncel tut.
  - Mevcut dosya temel değişkenleri içeriyor.
  - Yeni env değişkeni eklendiğinde açıklamasıyla birlikte bu dosyaya eklenmeli.

- [ ] `ARCHITECTURE.md` dosyasını geliştirme sırasında güncel tutma kuralı ekle.
  - Büyük route, tablo, editor veya ödeme akışı değişikliklerinde doküman da güncellenecek.

## Faz 1: Güvenlik ve Yetkilendirme

- [ ] Admin yetkilendirmesini tek kaynağa indir.
  - Mevcut durum: kullanıcıda `role` var, ama admin kontrolü çoğunlukla `ADMIN_EMAILS`.
  - Karar: role tabanlı model mi, email allowlist mi?
  - Tercih edilen hedef: role tabanlı model + production bootstrap için opsiyonel `ADMIN_EMAILS`.

- [ ] Admin kontrol helper'ı oluştur.
  - Öneri: `src/lib/admin-auth.ts`
  - Tüm admin page ve API route'ları aynı helper'ı kullanmalı.

- [ ] WooCommerce webhook secret'ını production'da zorunlu yap.
  - Mevcut risk: `WC_WEBHOOK_SECRET` boşsa imza doğrulaması bypass edilebiliyor.
  - Hedef: production'da secret yoksa webhook 500/401 dönmeli.

- [ ] Upload API güvenlik audit'i yap.
  - Kontrol edilecekler: auth, dosya tipi, dosya boyutu, path traversal, overwrite riski, public erişim, cache davranışı.

- [ ] Public analytics endpoint için abuse koruması tasarla.
  - En azından kaba rate limit veya scan dedupe stratejisi belirlenmeli.

## Faz 2: Domain Modeli ve Status Akışı

- [ ] Merkezi proje status transition modülü oluştur.
  - Öneri: `src/lib/project-status.ts`
  - User, admin, approval, studio ve webhook kaynaklı status geçişleri burada tanımlanmalı.

- [ ] Mevcut route'ları merkezi status helper'a geçir.
  - Kapsam: project PATCH, admin status, admin activate, approval, WooCommerce webhook, studio request.

- [ ] `projects.themeId` için Drizzle foreign key ekle.
  - Mevcut alan integer, fakat schema seviyesinde `themes.id` ilişkisi görünmüyor.

- [ ] `planId` kararını netleştir.
  - Seçenekler: plan tablosu ekle, alanı geçici olarak kaldırma planı yap, veya ileride kullanılacaksa dokümante et.

- [ ] Audit log kapsamını standartlaştır.
  - Hangi aksiyonların audit'e düşeceği netleşmeli: status change, approval send/respond, order complete, publish, delete, theme change.

## Faz 3: Test Altyapısı

- [ ] Test runner seç ve `package.json` içine test script'i ekle.
  - Öneri: Vitest.

- [ ] Content schema ve migration testleri ekle.
  - Kapsam: `src/schemas/*`, `src/lib/content-migrator.ts`.

- [ ] Free/premium limit testleri ekle.
  - Kapsam: `src/lib/plan-limits.ts`.

- [ ] Slug üretimi ve çakışma testleri ekle.
  - Kapsam: `src/lib/slug.ts`, project create/update akışı.

- [ ] WooCommerce webhook idempotency testleri ekle.
  - Kapsam: aynı `woocommerceOrderId` tekrar geldiğinde duplicate kayıt/publish olmaması.

- [ ] Admin authorization helper testleri ekle.

## Faz 4: QR1 Tasarım Yönetimi Taşıma Zemini

- [ ] QR1 `Bloklar / Şablonlar / Tasarımlar` ayrımını QRbir veri modeline geçir.
  - Kaynak repo: `https://github.com/umitkarakas/qr1-site`.
  - Korunacak mimari: block metadata, template composition ve design/theme token kayıtları ayrı sorumluluklar olmalı.
  - Geçici durum: `themes.themeConfigJson.editorContent` sadece migration/backward compatibility alanı olarak ele alınmalı.

- [x] Drizzle tablolarını tasarla ve migration üret.
  - `block_types`: QR1 `block_types` karşılığı.
  - `templates`: QR1 `templates` karşılığı.
  - `themes` veya `designs`: QR1 `themes` karşılığı olan görsel tasarım token kayıtları.
  - Karar: mevcut `themes` marketplace/theme tablosu QR1 tasarım token tablosuna dönüştürülecek mi, yoksa `designs` ayrı mı açılacak?

- [ ] QR1 seed ve varsayılan kayıtlarını taşı.
  - `block_types` ilk kayıtları.
  - Varsayılan template kayıtları.
  - Varsayılan active/free/premium tasarım kayıtları.
  - Durum: `block_types` seed migration'a eklendi; template/design seedleri bekliyor.

- [ ] `src/features/block-editor` servis katmanını QR1 mode modeline yaklaştır.
  - `project/live` mode: `project_contents.contentJson`.
  - `template` mode: `templates.blocks/settings/theme_id`.
  - `guest` mode: persistence olmayan demo akış.
  - Ortak save contract'ı route handler'lara bağlanmalı.

- [x] `AddBlockSheet` kaynaklarını admin block registry ile bağla.
  - Başlangıçta lokal `blockRegistry` fallback kalsın.
  - DB'deki `block_types.is_enabled`, `is_pro`, `allowed_site_types`, `category`, `sort_order` alanları uygulanmalı.

- [ ] Public renderer contract'ını netleştir.
  - Project content + template fallback + selected design/theme token zinciri belirlenmeli.
  - Eski renderer ve mevcut `BlockContentRenderer` geçiş boyunca kırılmamalı.

## Faz 5: Admin Bloklar, Şablonlar ve Tasarımlar

- [x] Admin sidebar'a QR1 yönetim menüsünü ekle.
  - Bloklar: `/admin/blocks`.
  - Şablonlar: `/admin/templates`.
  - Tasarımlar: `/admin/themes` veya karar verilirse `/admin/designs`.

- [x] `/admin/blocks` sayfasını ve API'sini taşı.
  - Liste, search/filter, active toggle, pro toggle, kategori ve izinli site tipleri.
  - QR1 `AdminBlocks.tsx` davranışı korunmalı.

- [ ] `/admin/templates` sayfasını ve API'sini taşı.
  - Liste, product/site type filtresi, active/premium toggle, silme ve editöre gitme.
  - QR1 `AdminTemplates.tsx` davranışı korunmalı.
  - Durum: liste sayfası, GET/POST/PATCH API ve active/premium toggle eklendi; silme ve template editor bekliyor.

- [ ] `/admin/templates/[templateId]/edit` template editörünü ekle.
  - QR1 `TemplateEditor.tsx` ve `TemplateEditorService.ts` Next.js + Drizzle modeline çevrilmeli.
  - Kayıt hedefi `templates.blocks/settings/theme_id` olmalı; `themes.themeConfigJson.editorContent` kullanılmamalı.

- [ ] `/admin/themes` tasarım yönetimini QR1 `AdminThemes.tsx` mantığına çek.
  - User-facing isim "Tasarımlar" olmalı.
  - `ThemeModal` config, preview image, active/premium ve style/token alanlarını yönetmeli.

- [ ] Müşteri proje editörü ile admin template editörü arasındaki sınırı koru.
  - `/projects/[id]/edit`: sadece proje instance içeriği.
  - `/admin/templates/[id]/edit`: reusable şablon kompozisyonu.
  - `/admin/themes` veya `/admin/designs`: sadece görsel tasarım token'ları.

- [ ] Geçiş migration'ını planla.
  - Mevcut `themes.themeConfigJson.editorContent` kayıtları gerekiyorsa `templates` tablosuna taşınmalı.
  - Preview route'ları migration bitene kadar eski alanı okuyabilmeli.

## Faz 6: QR Sticker Core Entegrasyonu

- [ ] `Develop/qr-sticker` reposundan taşınacak dosyaları netleştir.
  - Taşınacaklar: QR engine, composition, frame composition, export, schemas, shapes, frames, preview davranışı, reducer fikri.
  - Taşınmayacaklar: NextAuth, Prisma, eski dashboard, eski routes.

- [ ] `src/lib/sticker-core` modülünü oluştur.
  - Saf QR, shape, frame, composition ve export mantığı burada olmalı.

- [ ] `qr-code-styling` bağımlılığını değerlendirme ve ekleme.
  - Mevcut proje `qrcode` kullanıyor.
  - Eski sticker editörü `qr-code-styling` kullanıyor.
  - Karar: gelişmiş QR stilleri için yeni bağımlılık alınacak mı?

- [ ] Sticker design schema tanımla.
  - İçerik: project source, qrStyle, layout, output, productSku/wcProductId.

- [ ] Drizzle sticker tablolarını ekle.
  - `sticker_designs`
  - `sticker_presets`

- [ ] Migration üret.

## Faz 7: QR Sticker Editörü UI

- [ ] `src/components/sticker-editor` yapısını oluştur.
  - Editor shell, toolbar, inspector, preview canvas, preset panel, export controls.

- [ ] `/projects/[id]/stickers` liste sayfasını ekle.
  - Proje sahipliği kontrol edilmeli.

- [ ] `/projects/[id]/stickers/new` oluştur.
  - Varsayılan QR verisi projenin canonical public URL'i olmalı.

- [ ] `/projects/[id]/stickers/[stickerId]/edit` oluştur.
  - Var olan design JSON yüklenmeli.

- [ ] Sticker CRUD API'lerini ekle.
  - `GET/POST /api/projects/[id]/stickers`
  - `GET/PATCH/DELETE /api/projects/[id]/stickers/[stickerId]`

- [ ] Sticker export akışını ekle.
  - SVG ve PNG export.
  - Baskı ölçüsü, bleed, safe area kontrolü.

- [ ] Sticker sipariş akışını mevcut checkout ile bağla.
  - `physical_product` order type korunmalı.
  - `wcProductId` veya SKU design JSON/output alanından gelmeli.

- [ ] Eski `StickerPanel` kullanımını yeni editör akışına bağla.
  - Panel doğrudan sabit preview yerine "Sticker tasarla" CTA'sı verebilir.

## Faz 8: Public Rendering ve UX Kalitesi

- [ ] Public renderer'larda yeni template registry ile eski renderer uyumluluğunu birlikte çalıştır.

- [ ] Mobil viewport kurallarını her template için test et.
  - Bio link için `baseWidth` 390 civarı, max genişlik 430 gibi sınırlar net olmalı.

- [ ] Text overflow ve responsive kırılmaları için görsel kontrol ekle.

- [ ] Bottom nav / fixed action alanları için safe-area davranışını standartlaştır.

- [ ] Public sayfalarda SEO metadata ve `noindex` davranışını yeni template akışıyla koru.

## Faz 9: Operasyon ve Deploy

- [ ] Health endpoint ve Docker/runtime dokümantasyonunu README'e işle.

- [ ] DB migration deploy prosedürünü netleştir.

- [ ] Cron cleanup davranışını dokümante et ve test et.

- [ ] Production logging ve hata yakalama stratejisi belirle.

- [ ] Upload ve generated preview asset'leri için storage stratejisi belirle.
  - İlk aşama local `public/uploads`.
  - Sonraki aşama S3/R2/MinIO benzeri storage olabilir.

## Karar Bekleyen Konular

- [ ] Admin modeli: role tabanlı mı, `ADMIN_EMAILS` allowlist mi?
- [ ] QR sticker için `qr-code-styling` bağımlılığı alınacak mı?
- [ ] Tema editöründe Puck yalnızca spike mı olacak, yoksa kontrollü alan editörü olarak kalıcı mı?
- [ ] Tema preview image otomatik mi üretilecek, manuel upload yeterli mi?
- [ ] Sticker export dosyaları DB'de sadece metadata olarak mı tutulacak, dosya storage neresi olacak?
- [ ] Plan/abonelik modeli ne zaman first-class tablo olacak?
