"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Save } from "lucide-react";
import { useMemo, useState } from "react";
import type { ThemeConfig } from "@/types/theme";

type ThemeEditorMeta = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  productType: string;
  isFree: boolean;
  isPremium: boolean;
  previewImageUrl: string | null;
  templateId?: string;
  templateVersion?: number;
};

type Props = {
  theme: ThemeEditorMeta;
  baseConfig: ThemeConfig;
  availableTemplates: { id: string; name: string; version: number }[];
};

type FormState = {
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  isFree: boolean;
  isPremium: boolean;
  previewImageUrl: string;
  templateId: string;
  colors: {
    bg: string;
    fg: string;
    accent: string;
    card: string;
    cardFg: string;
    border: string;
    muted: string;
  };
  font: NonNullable<ThemeConfig["font"]>;
  radius: NonNullable<ThemeConfig["radius"]>;
  layout: string;
  style: string;
  effect: string;
};

const FONT_OPTIONS: { value: FormState["font"]; label: string }[] = [
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
  { value: "rounded", label: "Rounded" },
];

const RADIUS_OPTIONS: { value: FormState["radius"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "full", label: "Full" },
];

const STATUS_OPTIONS: { value: FormState["status"]; label: string }[] = [
  { value: "draft", label: "Taslak" },
  { value: "active", label: "Aktif" },
  { value: "archived", label: "Arşiv" },
];

export function ThemeEditorClient({ theme, baseConfig, availableTemplates }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<FormState>(() => ({
    name: theme.name,
    description: theme.description ?? "",
    status: theme.status,
    isFree: theme.isFree,
    isPremium: theme.isPremium,
    previewImageUrl: theme.previewImageUrl ?? "",
    templateId: theme.templateId ?? "",
    colors: {
      bg: baseConfig.colors.bg,
      fg: baseConfig.colors.fg,
      accent: baseConfig.colors.accent,
      card: baseConfig.colors.card ?? "",
      cardFg: baseConfig.colors.cardFg ?? "",
      border: baseConfig.colors.border ?? "",
      muted: baseConfig.colors.muted ?? "",
    },
    font: baseConfig.font ?? "sans",
    radius: baseConfig.radius ?? "md",
    layout: baseConfig.layout ?? "",
    style: baseConfig.style ?? "",
    effect: baseConfig.effect ?? "",
  }));

  const selectedTemplate = useMemo(
    () => availableTemplates.find((item) => item.id === form.templateId),
    [availableTemplates, form.templateId]
  );

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const themeConfigJson = compactConfig({
        colors: compactColors(form.colors),
        font: form.font,
        radius: form.radius,
        layout: form.layout.trim() || undefined,
        style: form.style.trim() || undefined,
        effect: form.effect.trim() || undefined,
        templateId: form.templateId || undefined,
        templateVersion: selectedTemplate?.version ?? theme.templateVersion ?? 1,
      });

      const res = await fetch(`/api/admin/themes/${theme.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          status: form.status,
          isFree: form.isFree,
          isPremium: form.isPremium,
          previewImageUrl: form.previewImageUrl.trim() || null,
          themeConfigJson,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Tasarım kaydedilemedi");
      setSaved(true);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Tasarım kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin/themes"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              title="Tasarımlara dön"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-slate-950">Tasarım Düzenle</h1>
              <p className="truncate text-xs text-slate-500">
                {theme.productType} · {theme.slug}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/themes/${theme.id}/preview`}
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:flex"
            >
              <ExternalLink className="h-4 w-4" />
              Önizle
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.name.trim() || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Kaydet
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <Panel title="Kimlik">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Tasarım Adı" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
              <SelectField
                label="Durum"
                value={form.status}
                options={STATUS_OPTIONS}
                onChange={(value) => setForm({ ...form, status: value as FormState["status"] })}
              />
            </div>
            <TextareaField
              label="Açıklama"
              value={form.description}
              onChange={(value) => setForm({ ...form, description: value })}
            />
            <TextField
              label="Önizleme Görseli URL"
              value={form.previewImageUrl}
              onChange={(value) => setForm({ ...form, previewImageUrl: value })}
              placeholder="https://..."
            />
            <div className="flex gap-4">
              <CheckboxField label="Ücretsiz tasarım" checked={form.isFree} onChange={(checked) => setForm({ ...form, isFree: checked })} />
              <CheckboxField label="Premium tasarım" checked={form.isPremium} onChange={(checked) => setForm({ ...form, isPremium: checked })} />
            </div>
          </Panel>

          <Panel title="Şablon Bağlantısı">
            <SelectField
              label="Şablon"
              value={form.templateId}
              options={[
                { value: "", label: "Şablon seçilmedi" },
                ...availableTemplates.map((template) => ({ value: template.id, label: template.name })),
              ]}
              onChange={(value) => setForm({ ...form, templateId: value })}
            />
            <p className="text-xs leading-5 text-slate-500">
              Tasarım yalnızca görsel token taşır. Blok dizilimi ve müşteri alanları şablon editöründe yönetilir.
            </p>
          </Panel>

          <Panel title="Renkler">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ColorField label="Arka Plan" value={form.colors.bg} onChange={(value) => setForm({ ...form, colors: { ...form.colors, bg: value } })} />
              <ColorField label="Metin" value={form.colors.fg} onChange={(value) => setForm({ ...form, colors: { ...form.colors, fg: value } })} />
              <ColorField label="Vurgu" value={form.colors.accent} onChange={(value) => setForm({ ...form, colors: { ...form.colors, accent: value } })} />
              <ColorField label="Kart" value={form.colors.card} onChange={(value) => setForm({ ...form, colors: { ...form.colors, card: value } })} />
              <ColorField label="Kart Metni" value={form.colors.cardFg} onChange={(value) => setForm({ ...form, colors: { ...form.colors, cardFg: value } })} />
              <ColorField label="Border" value={form.colors.border} onChange={(value) => setForm({ ...form, colors: { ...form.colors, border: value } })} />
              <ColorField label="Muted" value={form.colors.muted} onChange={(value) => setForm({ ...form, colors: { ...form.colors, muted: value } })} />
            </div>
          </Panel>

          <Panel title="Görsel Sistem">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField label="Font" value={form.font} options={FONT_OPTIONS} onChange={(value) => setForm({ ...form, font: value as FormState["font"] })} />
              <SelectField label="Radius" value={form.radius} options={RADIUS_OPTIONS} onChange={(value) => setForm({ ...form, radius: value as FormState["radius"] })} />
              <TextField label="Layout" value={form.layout} onChange={(value) => setForm({ ...form, layout: value })} placeholder="compact, editorial..." />
              <TextField label="Style" value={form.style} onChange={(value) => setForm({ ...form, style: value })} placeholder="flat, elevated..." />
              <TextField label="Effect" value={form.effect} onChange={(value) => setForm({ ...form, effect: value })} placeholder="none, glass..." />
            </div>
          </Panel>

          {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {saved ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Tasarım kaydedildi.</p> : null}
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <PreviewCard form={form} />
        </aside>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const colorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex gap-2">
        <input
          type="color"
          value={colorValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 rounded border border-slate-300 bg-white p-1"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#ffffff"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>
    </label>
  );
}

function PreviewCard({ form }: { form: FormState }) {
  const background = form.colors.bg || "#ffffff";
  const surface = form.colors.card || "#ffffff";
  const text = form.colors.fg || "#111827";
  const muted = form.colors.muted || "#64748b";
  const accent = form.colors.accent || "#2563eb";
  const radius = form.radius === "full" ? 28 : form.radius === "lg" ? 18 : form.radius === "md" ? 12 : form.radius === "sm" ? 8 : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Token Önizleme</h2>
      <div className="overflow-hidden rounded-[28px] border border-slate-900 bg-slate-900 p-3 shadow-xl">
        <div style={{ background, color: text, borderRadius: 22 }} className="min-h-[520px] p-5">
          <div style={{ background: surface, borderRadius: radius, borderColor: form.colors.border || "transparent" }} className="border p-4 shadow-sm">
            <div className="mb-4 h-16 w-16 rounded-2xl" style={{ background: accent }} />
            <h3 className="text-xl font-semibold">{form.name || "Tasarım Adı"}</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: muted }}>
              Bu alan yalnızca renk, radius ve temel görsel token önizlemesidir. Blok dizilimi şablonda yönetilir.
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: accent, color: form.colors.cardFg || "#ffffff", borderRadius: radius }}
            >
              Örnek Buton
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function compactColors(colors: FormState["colors"]): ThemeConfig["colors"] {
  return {
    bg: colors.bg || "#ffffff",
    fg: colors.fg || "#111827",
    accent: colors.accent || "#2563eb",
    ...(colors.card ? { card: colors.card } : {}),
    ...(colors.cardFg ? { cardFg: colors.cardFg } : {}),
    ...(colors.border ? { border: colors.border } : {}),
    ...(colors.muted ? { muted: colors.muted } : {}),
  };
}

function compactConfig(config: ThemeConfig & { templateId?: string; templateVersion?: number }) {
  return Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined && value !== "")
  );
}
