"use client";

import { useState } from "react";
import { Field, FormSection, SaveBar, inputCls, useSaver } from "./_form-shell";
import type { CampaignLinkV1Type } from "@/schemas/campaign_link/v1";

export default function CampaignLinkForm({
  projectId,
  initial,
}: {
  projectId: number;
  initial: CampaignLinkV1Type;
}) {
  const [c, setC] = useState<CampaignLinkV1Type>(initial);
  const { saving, error, message, save } = useSaver(projectId);

  function set<K extends keyof CampaignLinkV1Type>(k: K, v: CampaignLinkV1Type[K]) {
    setC({ ...c, [k]: v });
  }

  // Önizleme URL'i — UTM parametreleri eklenmiş hali
  const previewUrl = (() => {
    if (!c.url) return "";
    try {
      const url = new URL(c.url);
      if (c.utmSource) url.searchParams.set("utm_source", c.utmSource);
      if (c.utmMedium) url.searchParams.set("utm_medium", c.utmMedium);
      if (c.utmCampaign) url.searchParams.set("utm_campaign", c.utmCampaign);
      return url.toString();
    } catch {
      return c.url;
    }
  })();

  return (
    <div>
      <FormSection
        title="Hedef Bağlantı"
        description="QR kod tarandığında yönlendirilecek adres"
      >
        <Field label="Hedef URL *">
          <input
            className={inputCls}
            type="url"
            value={c.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="https://ornek.com/kampanya"
            maxLength={2000}
          />
        </Field>
        <Field label="Başlık (opsiyonel)" hint="Yönlendirme ekranında gösterilir">
          <input
            className={inputCls}
            value={c.title ?? ""}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Yaz Kampanyası 2025"
            maxLength={120}
          />
        </Field>
      </FormSection>

      <FormSection
        title="UTM Parametreleri"
        description="Google Analytics takibi için otomatik URL'e eklenir"
      >
        <div className="grid grid-cols-3 gap-3">
          <Field label="utm_source">
            <input
              className={inputCls}
              value={c.utmSource ?? ""}
              onChange={(e) => set("utmSource", e.target.value)}
              placeholder="qr"
              maxLength={100}
            />
          </Field>
          <Field label="utm_medium">
            <input
              className={inputCls}
              value={c.utmMedium ?? ""}
              onChange={(e) => set("utmMedium", e.target.value)}
              placeholder="qr_code"
              maxLength={100}
            />
          </Field>
          <Field label="utm_campaign">
            <input
              className={inputCls}
              value={c.utmCampaign ?? ""}
              onChange={(e) => set("utmCampaign", e.target.value)}
              placeholder="yaz_2025"
              maxLength={100}
            />
          </Field>
        </div>

        {previewUrl && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1 font-medium">Oluşan adres:</p>
            <p className="text-xs font-mono text-gray-700 break-all">{previewUrl}</p>
          </div>
        )}
      </FormSection>

      <SaveBar
        saving={saving}
        error={error}
        message={message}
        onSave={() => save(c)}
      />
    </div>
  );
}
