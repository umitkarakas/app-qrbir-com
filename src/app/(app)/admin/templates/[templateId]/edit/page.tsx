import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates, themes as designThemes } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { TemplateEditorClient } from "./template-editor-client";
import {
  createBlocksFromContent,
  createEditorSite,
  mapProjectTypeToSiteType,
  type EditorProject,
} from "@/features/block-editor/types/content";
import type { Block, Site, Theme } from "@/features/block-editor/types/database";
import type { ThemeConfig } from "@/features/block-editor/types/theme";
import type { ThemeConfig as StoredThemeConfig } from "@/types/theme";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

export default async function TemplateEditPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) redirect("/dashboard");

  const { templateId } = await params;
  const id = parseInt(templateId, 10);
  if (Number.isNaN(id)) notFound();

  const [template] = await db.select().from(templates).where(eq(templates.id, id));
  if (!template) notFound();

  const editorProject: EditorProject = {
    id: template.id,
    title: template.name,
    slug: template.slug,
    projectType: template.productType,
    subdomainType: "template",
    status: template.isActive ? "published" : "draft",
    viewCount: 0,
    qrCount: 0,
    themeName: null,
  };

  const settings = readRecord(template.settings);
  const savedSite = readRecord(settings.site);
  const site = createTemplateSite(editorProject, template.themeId, savedSite);
  const savedBlocks = Array.isArray(template.blocks) ? (template.blocks as Block[]) : [];
  const blocks = savedBlocks.length ? savedBlocks : createBlocksFromContent(editorProject, {});
  const themeRows = await db
    .select()
    .from(designThemes)
    .where(eq(designThemes.productType, template.productType))
    .orderBy(asc(designThemes.name));
  const themes: Theme[] = themeRows
    .filter((theme) => theme.status !== "archived")
    .map((theme) => mapDesignTheme(theme));

  return (
    <TemplateEditorClient
      template={{
        id: template.id,
        name: template.name,
        slug: template.slug,
        description: template.description,
        productType: template.productType,
        themeId: template.themeId,
        isActive: template.isActive,
        isPremium: template.isPremium,
        version: template.version,
        metadata: readRecord(template.metadata),
      }}
      site={site}
      blocks={blocks}
      themes={themes}
    />
  );
}

type DesignThemeRow = typeof designThemes.$inferSelect;

function mapDesignTheme(theme: DesignThemeRow): Theme {
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

function normalizeThemeConfig(value: unknown): ThemeConfig {
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
      return 'system-ui, -apple-system, "Segoe UI", sans-serif';
    default:
      return 'system-ui, -apple-system, "Segoe UI", sans-serif';
  }
}

function radiusValue(radius: string): string {
  switch (radius) {
    case "none":
      return "0";
    case "sm":
      return "0.25rem";
    case "lg":
      return "0.875rem";
    case "full":
      return "9999px";
    case "md":
    default:
      return "0.5rem";
  }
}

function spacingValue(spacing: string): string {
  switch (spacing) {
    case "compact": return "0.5rem";
    case "spacious": return "1.25rem";
    default: return "0.875rem";
  }
}

function shadowValue(shadow: string, accent: string): string {
  switch (shadow) {
    case "none":
      return "none";
    case "medium":
      return "0 18px 36px rgba(15, 23, 42, 0.18)";
    case "strong":
      return "0 24px 60px rgba(15, 23, 42, 0.28)";
    case "glow":
      return `0 18px 46px ${hexToRgba(accent, 0.32)}`;
    case "soft":
    default:
      return "0 10px 26px rgba(15, 23, 42, 0.12)";
  }
}

function hexToRgba(color: string, opacity: number): string {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(color.trim());
  if (!match) return color;
  const raw = match[1];
  return `rgba(${parseInt(raw.slice(0, 2), 16)}, ${parseInt(raw.slice(2, 4), 16)}, ${parseInt(raw.slice(4, 6), 16)}, ${opacity})`;
}

function createTemplateSite(
  project: EditorProject,
  themeId: number | null,
  savedSite: Record<string, unknown>
): Site {
  const base = createEditorSite(project, {});

  return {
    ...base,
    title: stringValue(savedSite.title) || project.title,
    description: nullableString(savedSite.description),
    site_type: stringValue(savedSite.site_type) || mapProjectTypeToSiteType(project.projectType),
    theme: readRecord(savedSite.theme),
    theme_id: themeId ? String(themeId) : nullableString(savedSite.theme_id),
    settings: readRecord(savedSite.settings),
  } as Site;
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
