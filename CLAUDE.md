# CLAUDE.md — QRbir Geliştirme Rehberi

Bu dosya AI ajanları ve katkıcılar için proje kısıtlamalarını ve çalışma kurallarını özetler.

## Proje Amacı

QRbir → "şablon seç, bilgileri gir, önizle, yayına al" modeli. Her yeni özellik bu cümleyi güçlendirmeli; projeyi ağır bir builder, router veya CMS'e dönüştürmemelidir.

## Geliştirme Fazları

| Faz | Konu | Durum |
|---|---|---|
| 1 | Temel altyapı (Next.js, auth, DB) | Tamamlandı |
| 2 | Proje ve ürün seçim sistemi | Tamamlandı |
| 3 | Tema sistemi | Tamamlandı |
| 4 | Bilgi giriş formları | Tamamlandı |
| 5 | Önizleme sistemi | Tamamlandı |
| 6 | Public yayın sistemi | Tamamlandı |
| 7 | QR kod sistemi | Tamamlandı |
| 8 | Admin / Studio sistemi | Tamamlandı |
| 9 | WooCommerce entegrasyonu | Tamamlandı |
| 10 | Sticker / Stand önizleme | Beklemede |

## Kritik Kurallar

### Mevcut kodu koruma
- Mevcut çalışan kodu sıfırdan yeniden yazma.
- Değişiklik yapmadan önce ilgili dosyayı oku; mevcut fonksiyonları yeniden kullan.
- Refactor yalnızca açıkça istendiğinde yapılır.

### Kütüphane ekleme
- Her yeni paket için `package.json`'daki bağımlılıkları kontrol et; önce mevcut araçlarla çözüm ara.
- Ağır UI builder kütüphaneleri (shadcn/ui dışında) ekleme; Tailwind yeterlidir.

### Veritabanı
- Şema değişikliklerinde `npm run db:generate` ile migration üret; doğrudan SQL yazma.
- `pending_orders` tablosunu ve `ref_token` mantığını anlamadan WooCommerce tarafında değişiklik yapma.

### Güvenlik
- Dosya yükleme endpoint'lerinde tip ve boyut kontrolü zorunlu.
- WooCommerce webhook: HMAC-SHA256 imza doğrulaması `src/app/api/webhooks/woocommerce/route.ts`'te uygulandı; bypass etme.
- Admin paneli: `ADMIN_EMAILS` env değişkeniyle korunuyor; rol bazlı erişimi değiştirme.

### İçerik Şemaları
- Yeni içerik tipi eklerken `src/schemas/` altında versiyonlu klasör yapısı kullan.
- Mevcut şemalarda breaking değişiklik → `src/lib/content-migrator.ts` güncellenmeli.

## Önemli Dosyalar

| Dosya | Açıklama |
|---|---|
| `src/middleware.ts` | Subdomain bazlı route yönlendirme |
| `src/lib/auth.ts` | better-auth yapılandırması |
| `src/lib/plan-limits.ts` | Free/Pro plan kısıtlamaları |
| `src/lib/content-migrator.ts` | İçerik şeması versiyonlar arası geçiş |
| `src/lib/mailer.ts` | Tüm e-posta gönderim fonksiyonları |
| `src/lib/payment/` | WooCommerce PaymentService adapter |
| `src/db/schema/orders.ts` | pending_orders + woocommerce_orders şemaları |
| `src/app/api/webhooks/woocommerce/route.ts` | WooCommerce webhook (HMAC imzalı) |
| `src/app/api/cron/cleanup/route.ts` | Süresi dolmuş pending_orders temizleme |

## Env Değişkenleri

Bkz. `.env.example` — tüm değişkenler açıklamalarıyla listeli.
