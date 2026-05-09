# QRbir — app.qrbir.com

QRbir, işletmelerin QR kod bağlantılı dijital arayüzler (restoran menüsü, bio link, Google yorum, etkinlik daveti, campaign link) oluşturmasını sağlayan SaaS platformudur.

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Dil:** TypeScript 5
- **Veritabanı:** PostgreSQL + Drizzle ORM
- **Auth:** better-auth
- **E-posta:** Resend
- **QR Üretim:** qrcode
- **Görsel İşleme:** Sharp
- **Stil:** Tailwind CSS 4

## Geliştirme Kurulumu

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Env dosyasını oluştur
cp .env.example .env
# .env içindeki değerleri doldur

# 3. Veritabanı migration'ı çalıştır
npm run db:migrate

# 4. Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

## Gerekli Ortam Değişkenleri

Tüm değişkenler `.env.example` dosyasında açıklamalarıyla birlikte listelenmiştir.

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı dizesi |
| `BETTER_AUTH_URL` | Auth ve cookie domain URL'i |
| `RESEND_API_KEY` | E-posta gönderimi (Resend) |
| `WC_WEBHOOK_SECRET` | WooCommerce webhook HMAC doğrulama |
| `ADMIN_EMAILS` | Admin paneli erişim listesi (virgülle ayrılmış) |
| `CRON_SECRET` | Cron endpoint güvenliği |

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint kontrolü |
| `npm run db:generate` | Drizzle migration dosyası oluştur |
| `npm run db:migrate` | Migration'ları uygula |
| `npm run db:studio` | Drizzle Studio (DB arayüzü) |

## Uygulama Yapısı

```
src/
├── app/
│   ├── (app)/        # Oturum gerektiren sayfalar (dashboard, admin, projeler)
│   ├── (auth)/       # Giriş / kayıt sayfaları
│   ├── api/          # API route'ları
│   │   ├── projects/ # Proje CRUD
│   │   ├── upload/   # Dosya yükleme
│   │   ├── webhooks/ # WooCommerce webhook
│   │   └── cron/     # Zamanlı temizleme işleri
│   └── pub/          # Public QR sayfaları ([subdomain]/[slug])
├── db/schema/        # Drizzle ORM şemaları
├── lib/              # Auth, DB, mailer, payment, plan-limits
└── schemas/          # İçerik tipi şemaları (versiyonlu)
    ├── restaurant_menu/
    ├── bio_link/
    ├── brand_bio/
    ├── google_review/
    ├── event_invitation/
    └── campaign_link/
```

## Subdomain Yönlendirme

Public sayfalar host'a göre render edilir:

| Subdomain | İçerik Tipi |
|---|---|
| `m.qrbir.com` | Restoran Menü |
| `b.qrbir.com` | Bio Link / Marka Bio |
| `r.qrbir.com` | Google Yorum |
| `e.qrbir.com` | Etkinlik / Davetiye |

## Deployment

Uygulama Docker container olarak deploy edilir:

```bash
docker build -t app-qrbir-com .
```

`next.config.ts` → `output: "standalone"` ile yapılandırılmıştır.
