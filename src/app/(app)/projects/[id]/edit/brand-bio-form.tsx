"use client";

import { useState } from "react";
import { Field, FormSection, SaveBar, inputCls, useSaver } from "./_form-shell";
import { ImageUploader } from "@/components/image-uploader";
import type { BrandBioV1Type } from "@/schemas/brand_bio/v1";
import type { ThemeConfig } from "@/types/theme";
import { PhoneFrame } from "@/components/phone-frame";
import { BrandBioRenderer } from "@/components/renderers/brand-bio";

export default function BrandBioForm({
  projectId,
  initial,
  theme,
}: {
  projectId: number;
  initial: BrandBioV1Type;
  theme?: ThemeConfig | null;
}) {
  const [c, setC] = useState<BrandBioV1Type>(initial);
  const { saving, error, message, save } = useSaver(projectId);

  function addLink() {
    setC({
      ...c,
      links: [
        ...c.links,
        { id: crypto.randomUUID(), label: "", url: "" },
      ],
    });
  }

  function updateLink(idx: number, patch: Partial<BrandBioV1Type["links"][number]>) {
    setC({
      ...c,
      links: c.links.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    });
  }

  function removeLink(idx: number) {
    setC({ ...c, links: c.links.filter((_, i) => i !== idx) });
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Sol: Form */}
      <div className="flex-1 min-w-0">
        <FormSection title="Marka Bilgileri" description="Sayfada görünecek temel bilgiler">
          <Field label="Marka Adı *">
            <input
              className={inputCls}
              value={c.brand.name}
              onChange={(e) => setC({ ...c, brand: { ...c.brand, name: e.target.value } })}
              maxLength={80}
              placeholder="Marka Adı"
            />
          </Field>
          <Field label="Slogan" hint="Kısa bir tagline (max 120)">
            <input
              className={inputCls}
              value={c.brand.tagline ?? ""}
              onChange={(e) => setC({ ...c, brand: { ...c.brand, tagline: e.target.value } })}
              maxLength={120}
              placeholder="Kaliteli hizmet, güvenilir marka"
            />
          </Field>
          <Field label="Açıklama" hint="Marka hakkında kısa metin (max 500)">
            <textarea
              className={inputCls}
              rows={3}
              value={c.brand.description ?? ""}
              onChange={(e) => setC({ ...c, brand: { ...c.brand, description: e.target.value } })}
              maxLength={500}
            />
          </Field>
          <Field label="Logo">
            <ImageUploader
              value={c.brand.logoUrl ?? ""}
              onChange={(url) => setC({ ...c, brand: { ...c.brand, logoUrl: url } })}
              label=""
              hint="Yuvarlak veya kare, PNG/JPG"
              shape="circle"
            />
          </Field>
          <Field label="Kapak Görseli">
            <ImageUploader
              value={c.brand.coverUrl ?? ""}
              onChange={(url) => setC({ ...c, brand: { ...c.brand, coverUrl: url } })}
              label=""
              hint="Geniş yatay görsel önerilir"
              shape="square"
            />
          </Field>
          <Field label="Web Sitesi">
            <input
              className={inputCls}
              value={c.brand.website ?? ""}
              onChange={(e) => setC({ ...c, brand: { ...c.brand, website: e.target.value } })}
              placeholder="https://markaadi.com"
              type="url"
            />
          </Field>
        </FormSection>

        <FormSection title="İletişim Bilgileri" description="Müşterilerin ulaşabileceği bilgiler">
          <Field label="Telefon">
            <input
              className={inputCls}
              value={c.contact.phone ?? ""}
              onChange={(e) => setC({ ...c, contact: { ...c.contact, phone: e.target.value } })}
              placeholder="+90 555 000 00 00"
              type="tel"
            />
          </Field>
          <Field label="E-posta">
            <input
              className={inputCls}
              value={c.contact.email ?? ""}
              onChange={(e) => setC({ ...c, contact: { ...c.contact, email: e.target.value } })}
              placeholder="info@marka.com"
              type="email"
            />
          </Field>
          <Field label="Adres">
            <textarea
              className={inputCls}
              rows={2}
              value={c.contact.address ?? ""}
              onChange={(e) => setC({ ...c, contact: { ...c.contact, address: e.target.value } })}
              placeholder="İstanbul, Türkiye"
            />
          </Field>
        </FormSection>

        <FormSection title="Sosyal Medya" description="Profil adreslerinizi veya kullanıcı adlarınızı girin">
          <div className="grid grid-cols-2 gap-2">
            {(["instagram", "twitter", "youtube", "linkedin", "tiktok"] as const).map((key) => (
              <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                <input
                  className={inputCls}
                  value={c.social[key] ?? ""}
                  onChange={(e) => setC({ ...c, social: { ...c.social, [key]: e.target.value } })}
                  placeholder="@kullanici"
                />
              </Field>
            ))}
          </div>
        </FormSection>

        <FormSection title="Öne Çıkan Linkler" description="Ürün, katalog, kampanya gibi bağlantılar">
          {c.links.length === 0 && (
            <p className="text-xs text-gray-400">Henüz link eklenmedi.</p>
          )}
          {c.links.map((link, idx) => (
            <div key={link.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  className={inputCls}
                  placeholder="Link adı (Kataloğumuzu İnceleyin…)"
                  value={link.label}
                  onChange={(e) => updateLink(idx, { label: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeLink(idx)}
                  className="text-red-500 hover:text-red-700 text-sm px-2"
                >
                  Sil
                </button>
              </div>
              <input
                className={inputCls}
                placeholder="https://…"
                type="url"
                value={link.url}
                onChange={(e) => updateLink(idx, { url: e.target.value })}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="text-sm text-blue-600 hover:underline"
          >
            + Link ekle
          </button>
        </FormSection>

        <SaveBar saving={saving} error={error} message={message} onSave={() => save(c)} />
      </div>

      {/* Sağ: Canlı Önizleme */}
      {theme && (
        <div className="hidden lg:block shrink-0 sticky top-6">
          <p className="text-xs text-gray-400 text-center mb-3 font-medium">Canlı Önizleme</p>
          <PhoneFrame>
            <BrandBioRenderer content={c} theme={theme} />
          </PhoneFrame>
        </div>
      )}
    </div>
  );
}
