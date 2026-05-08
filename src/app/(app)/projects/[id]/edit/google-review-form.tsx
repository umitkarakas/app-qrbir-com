"use client";

import { useState } from "react";
import { Field, FormSection, SaveBar, inputCls, useSaver } from "./_form-shell";
import type { GoogleReviewV1Type } from "@/schemas/google_review/v1";
import type { ThemeConfig } from "@/types/theme";
import { PhoneFrame } from "@/components/phone-frame";
import { GoogleReviewRenderer } from "@/components/renderers/google-review";

export default function GoogleReviewForm({
  projectId,
  initial,
  theme,
}: {
  projectId: number;
  initial: GoogleReviewV1Type;
  theme?: ThemeConfig | null;
}) {
  const [c, setC] = useState<GoogleReviewV1Type>(initial);
  const { saving, error, message, save } = useSaver(projectId);

  return (
    <div className="flex gap-6 items-start">
      {/* Sol: Form */}
      <div className="flex-1 min-w-0">
      <FormSection title="İşletme">
        <Field label="İşletme adı *">
          <input
            className={inputCls}
            value={c.business.name}
            onChange={(e) =>
              setC({ ...c, business: { ...c.business, name: e.target.value } })
            }
            maxLength={120}
            placeholder="Cafe Marka"
          />
        </Field>
        <Field label="Açıklama" hint="Sayfa başlığı altında çıkar">
          <textarea
            className={inputCls}
            rows={2}
            value={c.business.description ?? ""}
            onChange={(e) =>
              setC({
                ...c,
                business: { ...c.business, description: e.target.value },
              })
            }
            maxLength={280}
          />
        </Field>
        <Field label="Logo URL">
          <input
            className={inputCls}
            type="url"
            value={c.business.logoUrl ?? ""}
            onChange={(e) =>
              setC({
                ...c,
                business: { ...c.business, logoUrl: e.target.value },
              })
            }
            placeholder="https://…"
          />
        </Field>
      </FormSection>

      <FormSection
        title="Google Yorum"
        description="Yorum sayfasının davranışı"
      >
        <Field
          label="Google yorum URL'i *"
          hint="Google Maps üzerinden işletme yorum sayfası linki"
        >
          <input
            className={inputCls}
            type="url"
            value={c.googleReviewUrl}
            onChange={(e) => setC({ ...c, googleReviewUrl: e.target.value })}
            placeholder="https://g.page/r/…/review"
          />
        </Field>
        <Field label="Google Place ID" hint="Opsiyonel — analitik için">
          <input
            className={inputCls}
            value={c.googlePlaceId ?? ""}
            onChange={(e) => setC({ ...c, googlePlaceId: e.target.value })}
            placeholder="ChIJ…"
          />
        </Field>
        <Field label="Çağrı metni *">
          <input
            className={inputCls}
            value={c.ctaText}
            onChange={(e) => setC({ ...c, ctaText: e.target.value })}
            maxLength={80}
          />
        </Field>
        <Field
          label="Yıldız eşiği"
          hint="Bu yıldızdan az verirse iç geri bildirim formuna yönlenir"
        >
          <select
            className={inputCls}
            value={c.ratingThreshold}
            onChange={(e) =>
              setC({ ...c, ratingThreshold: parseInt(e.target.value, 10) })
            }
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} yıldız ve üzeri Google&apos;a yönlenir
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Geri bildirim e-posta"
          hint="Eşik altı yorumlar bu adrese gelir (opsiyonel)"
        >
          <input
            className={inputCls}
            type="email"
            value={c.feedbackEmail ?? ""}
            onChange={(e) => setC({ ...c, feedbackEmail: e.target.value })}
            placeholder="info@marka.com"
          />
        </Field>
      </FormSection>

      <SaveBar
        saving={saving}
        error={error}
        message={message}
        onSave={() => save(c)}
      />
      </div>

      {/* Sağ: Canlı Önizleme */}
      {theme && (
        <div className="hidden lg:block shrink-0 sticky top-6">
          <p className="text-xs text-gray-400 text-center mb-3 font-medium">Canlı Önizleme</p>
          <PhoneFrame>
            <GoogleReviewRenderer content={c} theme={theme} />
          </PhoneFrame>
        </div>
      )}
    </div>
  );
}
