"use client";

import { useState } from "react";
import { Field, FormSection, SaveBar, inputCls, useSaver } from "./_form-shell";
import type { BioLinkV1Type } from "@/schemas/bio_link/v1";
import type { ThemeConfig } from "@/types/theme";
import { PhoneFrame } from "@/components/phone-frame";
import { BioLinkRenderer } from "@/components/renderers/bio-link";

export default function BioLinkForm({
  projectId,
  initial,
  theme,
}: {
  projectId: number;
  initial: BioLinkV1Type;
  theme?: ThemeConfig | null;
}) {
  const [c, setC] = useState<BioLinkV1Type>(initial);
  const { saving, error, message, save } = useSaver(projectId);

  function addLink() {
    setC({
      ...c,
      links: [
        ...c.links,
        { id: crypto.randomUUID(), label: "", url: "", icon: "" },
      ],
    });
  }

  function updateLink(idx: number, patch: Partial<BioLinkV1Type["links"][number]>) {
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
      <FormSection title="Profil" description="Sayfada görünecek temel bilgiler">
        <Field label="İsim *">
          <input
            className={inputCls}
            value={c.profile.name}
            onChange={(e) =>
              setC({ ...c, profile: { ...c.profile, name: e.target.value } })
            }
            maxLength={80}
            placeholder="Ali Yılmaz"
          />
        </Field>
        <Field label="Bio" hint="Kısa açıklama (max 280)">
          <textarea
            className={inputCls}
            rows={2}
            value={c.profile.bio ?? ""}
            onChange={(e) =>
              setC({ ...c, profile: { ...c.profile, bio: e.target.value } })
            }
            maxLength={280}
          />
        </Field>
        <Field label="Avatar URL">
          <input
            className={inputCls}
            value={c.profile.avatarUrl ?? ""}
            onChange={(e) =>
              setC({
                ...c,
                profile: { ...c.profile, avatarUrl: e.target.value },
              })
            }
            placeholder="https://…"
            type="url"
          />
        </Field>
      </FormSection>

      <FormSection title="Linkler" description="Sayfada gösterilecek bağlantılar">
        {c.links.length === 0 && (
          <p className="text-xs text-gray-400">Henüz link eklenmedi.</p>
        )}
        {c.links.map((link, idx) => (
          <div
            key={link.id}
            className="border border-gray-200 rounded-lg p-3 space-y-2"
          >
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="Link adı (Instagram, Web sitesi…)"
                value={link.label}
                onChange={(e) =>
                  updateLink(idx, { label: e.target.value })
                }
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

      <FormSection title="Sosyal" description="Profillerinizin kullanıcı adları (opsiyonel)">
        <div className="grid grid-cols-2 gap-2">
          {(["instagram", "twitter", "youtube", "tiktok"] as const).map(
            (key) => (
              <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                <input
                  className={inputCls}
                  value={c.social[key] ?? ""}
                  onChange={(e) =>
                    setC({
                      ...c,
                      social: { ...c.social, [key]: e.target.value },
                    })
                  }
                  placeholder="@kullanici"
                />
              </Field>
            )
          )}
        </div>
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
            <BioLinkRenderer content={c} theme={theme} />
          </PhoneFrame>
        </div>
      )}
    </div>
  );
}
