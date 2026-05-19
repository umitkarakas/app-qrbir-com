"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { ThemeConfig } from "@/types/theme";

type ThemeCard = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  productType: string;
  previewImageUrl: string | null;
  isFree: boolean;
  isPremium: boolean;
  status: "draft" | "active" | "archived";
  themeConfigJson: unknown;
};

type Props = {
  themes: ThemeCard[];
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  restaurant_menu: "Restoran Menü",
  bio_link: "Bio Link",
  brand_bio: "Marka Bio",
  google_review: "Google Yorum",
  event_invitation: "Etkinlik",
  campaign_link: "Kampanya",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  active: "Aktif",
  archived: "Arşiv",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  archived: "bg-slate-100 text-slate-500 ring-slate-200",
};

export function ThemesGrid({ themes }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function duplicateTheme(theme: ThemeCard) {
    setBusyId(theme.id);
    try {
      const res = await fetch(`/api/admin/themes/${theme.id}`, { method: "POST" });
      if (!res.ok) throw new Error("Tasarım çoğaltılamadı");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTheme(theme: ThemeCard) {
    if (theme.status === "archived") {
      if (!window.confirm(`Bu tasarım kalıcı olarak silinecek. Geri alınamaz. Devam edilsin mi?`)) return;
      setBusyId(theme.id);
      try {
        const res = await fetch(`/api/admin/themes/${theme.id}?permanent=true`, { method: "DELETE" });
        if (!res.ok) throw new Error("Tasarım silinemedi");
        router.refresh();
      } finally {
        setBusyId(null);
      }
      return;
    }

    if (!window.confirm(`"${theme.name}" tasarımını arşivlemek istiyor musunuz?`)) return;
    setBusyId(theme.id);
    try {
      const res = await fetch(`/api/admin/themes/${theme.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Tasarım arşivlenemedi");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (themes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
        <p className="mb-2 text-lg font-medium text-slate-500">Henüz tasarım yok</p>
        <p className="text-sm">İlk tasarımı oluşturmak için Yeni Tasarım butonuna tıklayın.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {themes.map((theme) => (
        <article key={theme.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ThemePreview theme={theme} />

          <div className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-slate-950">{theme.name}</h2>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {PRODUCT_TYPE_LABELS[theme.productType] ?? theme.productType}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${STATUS_STYLES[theme.status]}`}>
                {STATUS_LABELS[theme.status] ?? theme.status}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
              <span className="truncate">{theme.description || theme.slug}</span>
              <span className="shrink-0 font-medium text-slate-700">
                {theme.isPremium ? "Premium" : theme.isFree ? "Ücretsiz" : "Özel"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
              <IconLink href={`/admin/themes/${theme.id}/edit`} label="Düzenle" icon={<Pencil className="h-4 w-4" />} />
              <IconLink href={`/admin/themes/${theme.id}/preview`} label="Önizle" icon={<Eye className="h-4 w-4" />} />
              <IconButton
                label="Çoğalt"
                icon={<Copy className="h-4 w-4" />}
                disabled={busyId === theme.id}
                onClick={() => duplicateTheme(theme)}
              />
              <IconButton
                label={theme.status === "archived" ? "Kalıcı Sil" : "Sil"}
                icon={<Trash2 className="h-4 w-4" />}
                disabled={busyId === theme.id}
                tone="danger"
                onClick={() => deleteTheme(theme)}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function IconLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
    >
      {icon}
      {label}
    </Link>
  );
}

function IconButton({
  icon,
  label,
  disabled,
  tone = "default",
  onClick,
}: {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
        tone === "danger"
          ? "border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ThemePreview({ theme }: { theme: ThemeCard }) {
  if (theme.previewImageUrl) {
    return (
      <div
        className="h-56 border-b border-slate-100 bg-cover bg-center"
        style={{ backgroundImage: `url("${theme.previewImageUrl}")` }}
      />
    );
  }

  const config = normalizeConfig(theme.themeConfigJson);
  const colors = config.colors;
  const surface = colors.card || "#ffffff";
  const background = resolveBackground(config);
  const accent = colors.accent || "#2563eb";
  const text = colors.heading || colors.fg || "#111827";
  const muted = colors.muted || "#64748b";
  const border = colors.border || "#e2e8f0";
  const radius = config.radius === "full" ? 28 : config.radius === "lg" ? 18 : config.radius === "sm" ? 8 : config.radius === "none" ? 0 : 12;

  return (
    <div className="border-b border-slate-100 p-4" style={{ background }}>
      <div
        className="mx-auto flex h-52 max-w-[260px] flex-col justify-between border p-4 shadow-lg"
        style={{ background: surface, borderColor: border, borderRadius: radius + 8 }}
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full" style={{ background: accent }} />
          <div className="min-w-0 flex-1">
            <div className="h-3 w-28 rounded" style={{ background: text }} />
            <div className="mt-2 h-2 w-20 rounded" style={{ background: muted }} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-9 rounded" style={{ background: colors.button || accent, borderRadius: Math.max(radius - 2, 0) }} />
          <div className="grid grid-cols-4 gap-2">
            {[accent, colors.link || accent, text, muted].map((color, index) => (
              <span key={`${color}-${index}`} className="h-6 rounded" style={{ background: color }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeConfig(value: unknown): ThemeConfig {
  if (value && typeof value === "object" && "colors" in value) return value as ThemeConfig;
  return { colors: { bg: "#ffffff", fg: "#111827", accent: "#2563eb" }, radius: "md" };
}

function resolveBackground(config: ThemeConfig) {
  const colors = config.colors;
  if (config.surface?.background === "gradient") {
    return `linear-gradient(${config.surface.gradientAngle ?? 135}deg, ${config.surface.gradientFrom ?? colors.bg}, ${config.surface.gradientTo ?? colors.accent})`;
  }
  return colors.bg || "#ffffff";
}
