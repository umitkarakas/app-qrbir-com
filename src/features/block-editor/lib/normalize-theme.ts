/**
 * normalize-theme.ts
 *
 * DB'de saklanan `ThemeConfig` (StoredThemeConfig — bg/fg/accent formatı) ile
 * block-editor bileşenlerinin çalışma zamanında beklediği `ThemeConfig`
 * (primary/background/text formatı) arasındaki dönüşümü yapar.
 *
 * Tek kaynak kural:
 *   - DB formatı    → @/types/theme     ThemeConfig    (fg, bg, accent, ...)
 *   - Runtime format → @/features/block-editor/types/theme  ThemeConfig (primary, background, text, ...)
 *
 * Bu modül her iki formatta çalışan kodu birleştiren tek yerdir.
 */

import type { ThemeConfig as StoredThemeConfig } from "@/types/theme";
import type { ThemeConfig, Theme } from "../types/theme";

// ---------------------------------------------------------------------------
// Tip tanımı: DB'den gelen satır (Drizzle `themes.$inferSelect` özeti)
// ---------------------------------------------------------------------------
export interface DesignThemeRow {
  id: number;
  name: string;
  description: string | null;
  previewImageUrl: string | null;
  isPremium: boolean;
  status: "draft" | "active" | "archived";
  themeConfigJson: unknown;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// DB satırını block-editor Theme tipine çevir
// ---------------------------------------------------------------------------
export function mapDesignTheme(theme: DesignThemeRow): Theme {
  const config = normalizeThemeConfig(theme.themeConfigJson);

  return {
    id: String(theme.id),
    name: theme.name,
    description: theme.description ?? "",
    style: config.style.blur ? "glassmorphism" : "flat",
    is_premium: theme.isPremium,
    is_active: theme.status === "active",
    config,
    preview_image: theme.previewImageUrl,
    created_at: theme.createdAt.toISOString(),
    updated_at: theme.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// StoredThemeConfig → runtime ThemeConfig dönüşümü
// ---------------------------------------------------------------------------
export function normalizeThemeConfig(value: unknown): ThemeConfig {
  const stored = readRecord(value) as Partial<StoredThemeConfig>;
  const colors = readRecord(stored.colors);
  const surface = readRecord(stored.surface);

  const accent = stringValue(colors.accent) || "#2563eb";
  const bg = stringValue(colors.bg) || "#ffffff";
  const text = stringValue(colors.fg) || "#111827";
  const radius = stringValue(stored.radius);
  const shadow = stringValue(surface.shadow);
  const font = stringValue(stored.font);

  return {
    colors: {
      primary: stringValue(colors.button) || accent,
      secondary: stringValue(colors.link) || accent,
      accent,
      background: bg,
      surface: solidColor(stringValue(colors.card) || "#ffffff"),
      text,
      textSecondary: stringValue(colors.muted) || "#64748b",
      border: stringValue(colors.border) || "#e2e8f0",
      error: "#dc2626",
      success: "#16a34a",
      warning: "#f59e0b",
    },
    fonts: {
      heading: fontFamily(font),
      body: fontFamily(font),
    },
    style: {
      borderRadius: radiusValue(radius),
      borderWidth: `${numberValue(surface.borderWidth, 1)}px`,
      shadow: shadowValue(shadow, accent),
      spacing: spacingValue(stringValue(surface.spacing)),
      ...(stringValue(stored.effect).includes("glass") ? { blur: "16px" } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Yardımcı fonksiyonlar (değişmez — iç kullanım)
// ---------------------------------------------------------------------------

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function solidColor(value: string): string {
  const match = value.match(/#[0-9a-fA-F]{6}/);
  return match?.[0] ?? value;
}

function fontFamily(font: string): string {
  switch (font) {
    case "serif":
      return 'Georgia, "Times New Roman", serif';
    case "mono":
      return '"Courier New", Courier, monospace';
    case "rounded":
    case "sans":
    default:
      return 'system-ui, -apple-system, "Segoe UI", sans-serif';
  }
}

function radiusValue(radius: string): string {
  switch (radius) {
    case "none": return "0";
    case "sm":   return "0.25rem";
    case "lg":   return "0.875rem";
    case "full": return "9999px";
    default:     return "0.5rem"; // "md"
  }
}

function spacingValue(spacing: string): string {
  switch (spacing) {
    case "compact":  return "0.5rem";
    case "spacious": return "1.25rem";
    default:         return "0.875rem";
  }
}

function shadowValue(shadow: string, accent: string): string {
  switch (shadow) {
    case "none":   return "none";
    case "medium": return "0 18px 36px rgba(15, 23, 42, 0.18)";
    case "strong": return "0 24px 60px rgba(15, 23, 42, 0.28)";
    case "glow":   return `0 18px 46px ${hexToRgba(accent, 0.32)}`;
    default:       return "0 10px 26px rgba(15, 23, 42, 0.12)"; // "soft"
  }
}

function hexToRgba(color: string, opacity: number): string {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(color.trim());
  if (!match) return color;
  const raw = match[1];
  return `rgba(${parseInt(raw.slice(0, 2), 16)}, ${parseInt(raw.slice(2, 4), 16)}, ${parseInt(raw.slice(4, 6), 16)}, ${opacity})`;
}
