"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { FONT_MAP } from "@/types/theme";
import type { ThemeConfig, ThemeSurface } from "@/types/theme";

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
  adminTemplates?: { id: number; name: string }[];
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
    heading: string;
    link: string;
    accent: string;
    button: string;
    buttonFg: string;
    card: string;
    cardFg: string;
    border: string;
    muted: string;
    overlay: string;
  };
  font: NonNullable<ThemeConfig["font"]>;
  radius: NonNullable<ThemeConfig["radius"]>;
  surface: Required<ThemeSurface>;
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

const SHADOW_OPTIONS: { value: FormState["surface"]["shadow"]; label: string }[] = [
  { value: "none", label: "Yok" },
  { value: "soft", label: "Yumuşak" },
  { value: "medium", label: "Orta" },
  { value: "strong", label: "Belirgin" },
  { value: "glow", label: "Glow" },
];

const BACKGROUND_OPTIONS: { value: FormState["surface"]["background"]; label: string }[] = [
  { value: "solid", label: "Düz" },
  { value: "gradient", label: "Gradient" },
  { value: "pattern", label: "Pattern" },
];

const SPACING_OPTIONS: { value: FormState["surface"]["spacing"]; label: string }[] = [
  { value: "compact", label: "Sıkı" },
  { value: "comfortable", label: "Dengeli" },
  { value: "spacious", label: "Ferah" },
];

export function ThemeEditorClient({ theme, baseConfig, availableTemplates, adminTemplates = [] }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [selectedAdminTemplateId, setSelectedAdminTemplateId] = useState<number | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
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
      heading: baseConfig.colors.heading ?? baseConfig.colors.fg,
      link: baseConfig.colors.link ?? baseConfig.colors.accent,
      accent: baseConfig.colors.accent,
      button: baseConfig.colors.button ?? baseConfig.colors.accent,
      buttonFg: baseConfig.colors.buttonFg ?? baseConfig.colors.cardFg ?? "#ffffff",
      card: baseConfig.colors.card ?? "",
      cardFg: baseConfig.colors.cardFg ?? "",
      border: baseConfig.colors.border ?? "",
      muted: baseConfig.colors.muted ?? "",
      overlay: baseConfig.colors.overlay ?? "",
    },
    font: baseConfig.font ?? "sans",
    radius: baseConfig.radius ?? "md",
    surface: {
      borderWidth: baseConfig.surface?.borderWidth ?? 1,
      shadow: baseConfig.surface?.shadow ?? "soft",
      background: baseConfig.surface?.background ?? (baseConfig.colors.bg.includes("gradient") ? "gradient" : "solid"),
      gradientFrom: baseConfig.surface?.gradientFrom ?? "#3b82f6",
      gradientTo: baseConfig.surface?.gradientTo ?? "#8b5cf6",
      gradientAngle: baseConfig.surface?.gradientAngle ?? 135,
      cardOpacity: baseConfig.surface?.cardOpacity ?? 100,
      spacing: baseConfig.surface?.spacing ?? "comfortable",
    },
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
        colors: compactColors({
          ...form.colors,
          bg: resolveBackground(form),
        }),
        font: form.font,
        radius: form.radius,
        surface: form.surface,
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
      setIframeKey((k) => k + 1);
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

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_390px]">
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

          <Panel title="Renk ve Tipografi">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ColorField label="Arka Plan" value={form.colors.bg} onChange={(value) => setForm({ ...form, colors: { ...form.colors, bg: value } })} />
              <ColorField label="Başlık" value={form.colors.heading} onChange={(value) => setForm({ ...form, colors: { ...form.colors, heading: value } })} />
              <ColorField label="Metin" value={form.colors.fg} onChange={(value) => setForm({ ...form, colors: { ...form.colors, fg: value } })} />
              <ColorField label="Link" value={form.colors.link} onChange={(value) => setForm({ ...form, colors: { ...form.colors, link: value } })} />
              <ColorField label="Vurgu" value={form.colors.accent} onChange={(value) => setForm({ ...form, colors: { ...form.colors, accent: value } })} />
              <ColorField label="Buton" value={form.colors.button} onChange={(value) => setForm({ ...form, colors: { ...form.colors, button: value } })} />
              <ColorField label="Buton Metni" value={form.colors.buttonFg} onChange={(value) => setForm({ ...form, colors: { ...form.colors, buttonFg: value } })} />
              <ColorField label="Kart" value={form.colors.card} onChange={(value) => setForm({ ...form, colors: { ...form.colors, card: value } })} />
              <ColorField label="Kart Metni" value={form.colors.cardFg} onChange={(value) => setForm({ ...form, colors: { ...form.colors, cardFg: value } })} />
              <ColorField label="Çerçeve" value={form.colors.border} onChange={(value) => setForm({ ...form, colors: { ...form.colors, border: value } })} />
              <ColorField label="İkincil Metin" value={form.colors.muted} onChange={(value) => setForm({ ...form, colors: { ...form.colors, muted: value } })} />
              <ColorField label="Dekor Katmanı" value={form.colors.overlay} onChange={(value) => setForm({ ...form, colors: { ...form.colors, overlay: value } })} />
            </div>
            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <SelectField label="Font" value={form.font} options={FONT_OPTIONS} onChange={(value) => setForm({ ...form, font: value as FormState["font"] })} />
              <TextField label="Font Stili" value={form.style} onChange={(value) => setForm({ ...form, style: value })} placeholder="modern, editorial, luxury..." />
            </div>
          </Panel>

          <Panel title="Arkaplan, Çerçeve ve Efekt">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                label="Arkaplan Tipi"
                value={form.surface.background}
                options={BACKGROUND_OPTIONS}
                onChange={(value) => setForm({ ...form, surface: { ...form.surface, background: value as FormState["surface"]["background"] } })}
              />
              <SelectField label="Radius" value={form.radius} options={RADIUS_OPTIONS} onChange={(value) => setForm({ ...form, radius: value as FormState["radius"] })} />
              <ColorField label="Gradient Başlangıç" value={form.surface.gradientFrom} onChange={(value) => setForm({ ...form, surface: { ...form.surface, gradientFrom: value } })} />
              <ColorField label="Gradient Bitiş" value={form.surface.gradientTo} onChange={(value) => setForm({ ...form, surface: { ...form.surface, gradientTo: value } })} />
              <RangeField label="Gradient Açısı" value={form.surface.gradientAngle} min={0} max={360} step={15} suffix="°" onChange={(value) => setForm({ ...form, surface: { ...form.surface, gradientAngle: value } })} />
              <RangeField label="Çerçeve Kalınlığı" value={form.surface.borderWidth} min={0} max={6} step={1} suffix="px" onChange={(value) => setForm({ ...form, surface: { ...form.surface, borderWidth: value } })} />
              <SelectField label="Gölge" value={form.surface.shadow} options={SHADOW_OPTIONS} onChange={(value) => setForm({ ...form, surface: { ...form.surface, shadow: value as FormState["surface"]["shadow"] } })} />
              <SelectField label="Boşluk Sistemi" value={form.surface.spacing} options={SPACING_OPTIONS} onChange={(value) => setForm({ ...form, surface: { ...form.surface, spacing: value as FormState["surface"]["spacing"] } })} />
              <RangeField label="Kart Opaklığı" value={form.surface.cardOpacity} min={40} max={100} step={5} suffix="%" onChange={(value) => setForm({ ...form, surface: { ...form.surface, cardOpacity: value } })} />
              <TextField label="Efekt" value={form.effect} onChange={(value) => setForm({ ...form, effect: value })} placeholder="glass, blur, glow..." />
              <TextField label="Layout" value={form.layout} onChange={(value) => setForm({ ...form, layout: value })} placeholder="compact, editorial..." />
            </div>
          </Panel>

          {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {saved ? <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Tasarım kaydedildi.</p> : null}
        </section>

        <aside className="lg:fixed lg:right-[max(1rem,calc((100vw-80rem)/2+1rem))] lg:top-24 lg:w-[360px]">
          {adminTemplates.length > 0 && (
            <div className="mb-3">
              <select
                value={selectedAdminTemplateId ?? ""}
                onChange={(e) => setSelectedAdminTemplateId(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="">— Şablon seç (gerçek içerik önizleme) —</option>
                {adminTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          {selectedAdminTemplateId ? (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Şablon Önizleme</h2>
                <span className="text-xs text-slate-400">Kaydet → güncel görünür</span>
              </div>
              <iframe
                key={iframeKey}
                src={`/admin/themes/${theme.id}/template-preview?templateId=${selectedAdminTemplateId}`}
                className="w-full border-0"
                style={{ height: "calc(100vh - 200px)" }}
                title="Şablon önizleme"
              />
            </div>
          ) : (
            <PreviewCard form={form} />
          )}
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

function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        {label}
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs tabular-nums text-slate-600">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-slate-950"
      />
    </label>
  );
}

function PreviewCard({ form }: { form: FormState }) {
  const background = resolveBackground(form);
  const surface = withOpacity(form.colors.card || "#ffffff", form.surface.cardOpacity);
  const text = form.colors.fg || "#111827";
  const heading = form.colors.heading || text;
  const muted = form.colors.muted || "#64748b";
  const accent = form.colors.accent || "#2563eb";
  const link = form.colors.link || accent;
  const button = form.colors.button || accent;
  const buttonFg = form.colors.buttonFg || "#ffffff";
  const border = form.colors.border || "rgba(15,23,42,0.12)";
  const overlay = form.colors.overlay || accent;
  const radius = form.radius === "full" ? 28 : form.radius === "lg" ? 18 : form.radius === "md" ? 12 : form.radius === "sm" ? 8 : 0;
  const spacing = form.surface.spacing === "spacious" ? 18 : form.surface.spacing === "compact" ? 10 : 14;
  const shadow = shadowValue(form.surface.shadow, accent);
  const pattern =
    form.surface.background === "pattern"
      ? {
          backgroundImage: `radial-gradient(circle at 18px 18px, ${withOpacity(overlay, 24)} 0 2px, transparent 2px)`,
          backgroundSize: "34px 34px",
        }
      : {};

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Canlı Stil Önizleme</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{form.surface.background}</span>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-slate-900 bg-slate-900 p-3 shadow-xl">
        <div
          style={{ background, color: text, borderRadius: 22, fontFamily: FONT_MAP[form.font], ...pattern }}
          className="relative max-h-[calc(100vh-190px)] min-h-[620px] overflow-y-auto p-4"
        >
          <div className="pointer-events-none absolute inset-x-4 top-4 h-1" style={{ background: withOpacity(overlay, 46), borderRadius: 999 }} />

          <section
            style={{ background: surface, borderRadius: radius + 8, borderColor: border, borderWidth: form.surface.borderWidth, boxShadow: shadow }}
            className="relative border p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 rounded-2xl" style={{ background: accent, borderRadius: radius }} />
              <div className="min-w-0">
                <h3 className="truncate text-xl font-semibold" style={{ color: heading }}>
                  {form.name || "Tasarım Adı"}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide" style={{ color: muted }}>
                  {form.layout || "premium layout"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6" style={{ color: text }}>
              Başlık, metin, link, kart, çerçeve ve gölge tokenları aynı ekranda birlikte test edilir.
            </p>
            <a className="mt-2 inline-flex text-sm font-semibold" style={{ color: link }} href="#preview-link">
              Link rengi örneği
            </a>
          </section>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {["Menü", "Rezervasyon"].map((label, index) => (
              <div
                key={label}
                style={{ background: surface, borderRadius: radius, borderColor: border, borderWidth: form.surface.borderWidth, boxShadow: shadow }}
                className="border p-3"
              >
                <div className="mb-3 h-20" style={{ borderRadius: Math.max(radius - 2, 0), background: index === 0 ? withOpacity(accent, 18) : withOpacity(overlay, 18) }} />
                <p className="text-sm font-semibold" style={{ color: heading }}>
                  {label}
                </p>
                <p className="mt-1 text-xs" style={{ color: muted }}>
                  Kart bloğu
                </p>
              </div>
            ))}
          </div>

          <section
            style={{ background: surface, borderRadius: radius, borderColor: border, borderWidth: form.surface.borderWidth, boxShadow: shadow }}
            className="mt-4 border"
          >
            {["Öne çıkan ürün", "Sosyal link", "İletişim satırı"].map((label, index) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b px-4 last:border-b-0"
                style={{ borderColor: withOpacity(border, 55), paddingTop: spacing, paddingBottom: spacing }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: heading }}>
                    {label}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: muted }}>
                    {index === 0 ? "Metin ve ikincil renk" : "Çizgi, boşluk ve radius"}
                  </p>
                </div>
                <span className="h-8 w-8 shrink-0 rounded-full" style={{ background: index === 1 ? link : accent }} />
              </div>
            ))}
          </section>

          <button
            type="button"
            className="mt-4 w-full px-4 py-3 text-sm font-semibold"
            style={{ background: button, color: buttonFg, borderRadius: radius, boxShadow: shadow }}
          >
            Birincil Buton
          </button>

          <div className="mt-4 flex gap-2">
            {[accent, link, heading, muted].map((color, index) => (
              <span key={`${color}-${index}`} className="h-9 flex-1 rounded-lg border border-white/20" style={{ background: color }} />
            ))}
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
    ...(colors.heading ? { heading: colors.heading } : {}),
    ...(colors.link ? { link: colors.link } : {}),
    accent: colors.accent || "#2563eb",
    ...(colors.button ? { button: colors.button } : {}),
    ...(colors.buttonFg ? { buttonFg: colors.buttonFg } : {}),
    ...(colors.card ? { card: colors.card } : {}),
    ...(colors.cardFg ? { cardFg: colors.cardFg } : {}),
    ...(colors.border ? { border: colors.border } : {}),
    ...(colors.muted ? { muted: colors.muted } : {}),
    ...(colors.overlay ? { overlay: colors.overlay } : {}),
  };
}

function resolveBackground(form: FormState) {
  if (form.surface.background === "gradient") {
    return `linear-gradient(${form.surface.gradientAngle}deg, ${form.surface.gradientFrom}, ${form.surface.gradientTo})`;
  }
  return form.colors.bg || "#ffffff";
}

function shadowValue(shadow: FormState["surface"]["shadow"], accent: string) {
  switch (shadow) {
    case "none":
      return "none";
    case "medium":
      return "0 18px 36px rgba(15, 23, 42, 0.18)";
    case "strong":
      return "0 24px 60px rgba(15, 23, 42, 0.28)";
    case "glow":
      return `0 18px 46px ${withOpacity(accent, 32)}`;
    case "soft":
    default:
      return "0 10px 26px rgba(15, 23, 42, 0.12)";
  }
}

function withOpacity(color: string, opacity: number) {
  const hex = color.trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return color;

  const raw = match[1];
  const red = parseInt(raw.slice(0, 2), 16);
  const green = parseInt(raw.slice(2, 4), 16);
  const blue = parseInt(raw.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(opacity, 100)) / 100})`;
}

function compactConfig(config: ThemeConfig & { templateId?: string; templateVersion?: number }) {
  return Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined && value !== "")
  );
}
