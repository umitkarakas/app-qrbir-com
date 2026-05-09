# QRbir Tema Builder — Skill Rehberi

Bu dosya yeni bir tema template'i oluştururken Claude'un uyması gereken kuralları, kontraktları ve adımları içerir. Ekran görüntüsü verildiğinde buraya göre TypeScript template kodu üretilir.

---

## 1. Proje Prensibi

QRbir'in tema sistemi **code-first**'tir. Her tema bir TypeScript dosyasıdır. Online editör sadece `editorSchema`'nın açtığı token alanlarını değiştirir; render kodunu değiştirmez.

> Yeni fikir şu cümleyle kontrol edilir: Bu template "şablon seç, bilgileri gir, önizle, yayına al" modelini güçlendiriyor mu? Serbest bir sayfa builder'a mı dönüşüyor?

---

## 2. ThemeTemplate Kontraktı

Her template şu tipte implement edilmelidir:

```typescript
// src/lib/theme-editor/contract.ts
export type ThemeTemplate<TContent, TConfig extends ThemeConfig> = {
  id: string;           // "bio-link/tema-adi" formatı, küçük harf tire
  name: string;         // Kullanıcıya gösterilecek isim
  productType: ProjectType;
  version: number;      // 1'den başlar
  viewport: {
    baseWidth: number;  // 390 = iPhone 14 genişliği (standart)
    minWidth: number;   // genellikle 320
    maxWidth: number;   // genellikle 430
    safeArea: "mobile" | "full" | "responsive";
  };
  capabilities: string[];   // ["darkMode", "avatarImage", "socialIcons", "tabs", "heroImage"]
  defaultConfig: TConfig;   // Tema ilk oluşturulduğunda kullanılan varsayılan değerler
  editorSchema: EditorSchema; // Online editörde gösterilecek kontroller
  render: (props: {
    content: TContent;
    theme: TConfig;
    mode: "preview" | "public";
  }) => React.ReactNode;
};
```

---

## 3. Ürün Tipleri ve İçerik Şemaları

### `bio_link` — Bio Link
```typescript
// src/schemas/bio_link/v1.ts
type BioLinkV1Type = {
  profile: { name: string; bio?: string; avatarUrl?: string };
  links: { id: string; label: string; url: string; icon?: string }[];
  social: { instagram?: string; twitter?: string; youtube?: string; tiktok?: string };
}
```

### `restaurant_menu` — Restoran Menü
```typescript
// src/schemas/restaurant_menu/v1.ts
type RestaurantMenuV1Type = {
  restaurant: { name: string; phone?: string; address?: string; instagram?: string; logoUrl?: string };
  currency: "TRY" | "USD" | "EUR";
  categories: {
    id: string; name: string;
    items: { id: string; name: string; description?: string; price: number; imageUrl?: string }[];
  }[];
}
```

### `brand_bio` — Marka Bio
Yapı `bio_link` ile benzer; renderer `brand_bio` şemasını kullanır.

### `google_review` — Google Yorum
```typescript
type GoogleReviewV1Type = {
  business: { name: string; reviewUrl: string; logoUrl?: string; rating?: number };
}
```

### `event_invitation` — Etkinlik Daveti
```typescript
type EventInvitationV1Type = {
  event: { title: string; date: string; time?: string; location?: string; description?: string; imageUrl?: string };
  rsvp?: { enabled: boolean; formUrl?: string };
}
```

### `campaign_link` — Kampanya
Server-side redirect — public renderer yoktur, template oluşturulmaz.

---

## 4. Token Sistemi (ThemeConfig)

```typescript
// src/types/theme.ts
type ThemeConfig = {
  colors: {
    bg: string;       // hex veya "linear-gradient(...)"
    fg: string;       // ana metin
    accent: string;   // buton, vurgu
    card?: string;    // kart arka planı
    cardFg?: string;  // kart metni
    border?: string;  // kenar rengi
    muted?: string;   // ikincil metin
  };
  font?: "sans" | "serif" | "mono" | "rounded";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  layout?: string;    // serbest string, template kendisi yorumlar
  style?: string;
  effect?: string;
};

// Yardımcı fonksiyonlar (import edilerek kullanılır)
FONT_MAP: { sans: string; serif: string; mono: string; rounded: string }
RADIUS_MAP: { none: "0px"; sm: "4px"; md: "8px"; lg: "14px"; full: "9999px" }
bgStyle(bg: string): React.CSSProperties  // gradient desteği
```

---

## 5. EditorSchema — Online Editör Kontrolleri

Template, online editörde hangi alanların gösterileceğini `editorSchema` ile tanımlar:

```typescript
editorSchema: {
  sections: [
    {
      label: "Renkler",
      fields: [
        { type: "color", key: "colors.bg", label: "Arka Plan" },
        { type: "color", key: "colors.accent", label: "Vurgu Rengi" },
      ]
    },
    {
      label: "Tipografi",
      fields: [
        { type: "font", key: "font", label: "Font" },
        { type: "radius", key: "radius", label: "Köşe Yuvarlama" },
      ]
    },
    {
      label: "Düzen",
      fields: [
        { type: "toggle", key: "layout.showBio", label: "Bio Göster" },
        { type: "select", key: "layout.avatarSize", label: "Avatar", options: [
          { label: "Küçük", value: "sm" }, { label: "Büyük", value: "lg" }
        ]},
      ]
    }
  ]
}
```

**Alan tipleri:**
- `color` — hex renk picker
- `font` — sans/serif/mono/rounded seçici
- `radius` — none/sm/md/lg/full seçici
- `toggle` — boolean switch
- `select` — dropdown seçici
- `range` — sayısal slider (min/max/step)

**Key formatı:** Noktalı yol (dot notation). `"colors.bg"` → `config.colors.bg` değerini okur/yazar.

---

## 6. Dosya Konumları

```
src/
  lib/theme-editor/
    contract.ts       # ThemeTemplate tipi — değiştirme
    registry.ts       # Template listesi — yeni template'i buraya ekle

  themes/
    {product-type}/
      templates/
        {tema-adi}.tsx  # ← Yeni template buraya
      index.ts          # Template'leri export et — buraya import ekle
      fixtures.ts       # Demo içerik (varsa)
```

---

## 7. Görsel Analiz Protokolü

Ekran görüntüsü verildiğinde şu sırayla analiz et:

1. **Ürün tipi ne?** — Bio link mi, restoran menü mü, başka mı?
2. **Viewport:** Mobil mi masaüstü mü? İçeriğin merkezlenmesi var mı?
3. **Renk paleti:** Arka plan, metin, vurgu, kart renklerini tespit et (hex değerler).
4. **Tipografi:** Font ailesi (sans/serif/mono), ağırlık, başlık/gövde boyutları.
5. **Layout:** Avatar nerede, linkler nasıl dizilmiş, sosyal ikonlar var mı?
6. **Özel bileşenler:** Tab bar, hero image, sticky header, bottom nav gibi özel elementler var mı? Bunlar `capabilities`'e eklenir.
7. **Animasyon/efekt:** Glassmorphism, gradient, shadow, border öne çıkıyor mu?

---

## 8. Template Yazım Kuralları

1. **ThemeConfig token kullan** — Renk, font, radius için sabit değer yazma; `theme.colors.bg`, `FONT_MAP[theme.font]` gibi token'ları kullan. Böylece online editör bu alanları güncelleyebilir.
2. **Inline style kullan** — `className` yerine `style={{}}` önerilir; Tailwind sınıfları runtime'da değişmez.
3. **Mode'a duyarlı ol** — `mode === "preview"` ise animasyon veya lazy-load gerekmez; `mode === "public"` ise SEO ve hydration düşünülmeli.
4. **Bağımsız React component** — Template bir Next.js sayfasına değil, hem editörde hem public sayfada render edilebilecek saf bir React fonksiyonu olmalıdır.
5. **Mevcut renderer'ı sarma** — `BioLinkRenderer` gibi mevcut renderer'ları KULLANMA; her template kendi `render()` fonksiyonunu tanımlar.
6. **`"use client"` yazmama** — Template dosyası server-compatible olmalıdır; interaktif parçalar için ayrı client component kullanılabilir.

---

## 9. Registry'e Kayıt

Yeni template oluşturulduktan sonra:

```typescript
// src/themes/{product-type}/index.ts
import { yeniTemplate } from "./templates/yeni-tema";
export const {productType}Templates = [...mevcutTemplates, yeniTemplate];

// src/lib/theme-editor/registry.ts
import { {productType}Templates } from "@/themes/{product-type}";
const ALL_TEMPLATES: ThemeTemplate[] = [
  ...bioLinkTemplates,
  ...{productType}Templates,  // ← ekle
];
```

---

## 10. Örnek: Minimal Dark (Bio Link)

Referans için: `src/themes/bio-link/templates/minimal-dark.tsx`

Özellikleri:
- Koyu arka plan (#0f0f0f), açık metin
- Avatar: yuvarlak, accent rengi kenarlık; yoksa baş harf placeholder
- Linkler: kart arka planlı butonlar, tam genişlik
- Sosyal ikonlar: altta, emoji gösterimiyle
- editorSchema: Renkler (6 alan) + Tipografi (2 alan)
- viewport: 390px baseWidth, mobile safeArea

---

## 11. Çıktı Formatı

Template üretildiğinde şu yapı beklenir:

```
src/themes/{product-type}/templates/{tema-adi}.tsx   ← ana template dosyası
```

Sonra şu dosyalar güncellenir:
```
src/themes/{product-type}/index.ts  ← yeni template import edilir
```

Template online editörde görünmesi için `/admin/themes/new` üzerinden kayıt edilmesi gerekir.
