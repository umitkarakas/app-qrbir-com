import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { themes, templates as adminTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { BlockContentRenderer } from "@/features/block-editor/components/BlockContentRenderer";
import type { StoredThemeConfig } from "@/lib/theme-editor/contract";
import type { Block } from "@/features/block-editor/types/database";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export default async function ThemeTemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ themeId: string }>;
  searchParams: Promise<{ templateId?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) redirect("/dashboard");

  const { themeId } = await params;
  const id = parseInt(themeId, 10);
  if (isNaN(id)) notFound();

  const { templateId: templateIdStr } = await searchParams;
  const templateId = templateIdStr ? parseInt(templateIdStr, 10) : NaN;
  if (isNaN(templateId)) notFound();

  const [[theme], [adminTemplate]] = await Promise.all([
    db.select().from(themes).where(eq(themes.id, id)),
    db.select({ blocks: adminTemplates.blocks, name: adminTemplates.name }).from(adminTemplates).where(eq(adminTemplates.id, templateId)),
  ]);

  if (!theme || !adminTemplate) notFound();

  const stored = theme.themeConfigJson as StoredThemeConfig;
  const cssVars = storedConfigToCssVars(stored);
  const bg = resolveStoredBg(stored);
  const blocks = Array.isArray(adminTemplate.blocks) ? (adminTemplate.blocks as Block[]) : [];

  const content = {
    editor: "qr1-blocks" as const,
    version: 1 as const,
    site: {
      title: adminTemplate.name,
      description: null,
      site_type: "bio_link" as const,
      theme: { colors: { background: bg } },
      theme_id: String(id),
      settings: {},
    },
    blocks,
  };

  return (
    <div style={{ ...cssVars, background: bg, minHeight: "100vh" } as React.CSSProperties}>
      <BlockContentRenderer content={content} />
    </div>
  );
}

function resolveStoredBg(stored: StoredThemeConfig): string {
  const surface = stored.surface as Record<string, unknown> | undefined;
  if (surface?.background === "gradient") {
    const from = (surface.gradientFrom as string) ?? "#3b82f6";
    const to = (surface.gradientTo as string) ?? "#8b5cf6";
    const angle = (surface.gradientAngle as number) ?? 135;
    return `linear-gradient(${angle}deg, ${from}, ${to})`;
  }
  const colors = stored.colors as Record<string, string> | undefined;
  return colors?.bg || "#ffffff";
}

function storedConfigToCssVars(stored: StoredThemeConfig): Record<string, string> {
  const colors = (stored.colors ?? {}) as Record<string, string>;
  const surface = (stored.surface ?? {}) as Record<string, unknown>;
  const accent = colors.accent || "#2563eb";
  const radMap: Record<string, string> = { none: "0px", sm: "4px", md: "8px", lg: "14px", full: "9999px" };
  const shadowMap: Record<string, string> = {
    none: "none",
    soft: "0 10px 26px rgba(15,23,42,0.12)",
    medium: "0 18px 36px rgba(15,23,42,0.18)",
    strong: "0 24px 60px rgba(15,23,42,0.28)",
    glow: `0 18px 46px ${accent}52`,
  };
  const fontMap: Record<string, string> = {
    serif: 'Georgia, "Times New Roman", serif',
    mono: '"Courier New", Courier, monospace',
    rounded: "system-ui, sans-serif",
    sans: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  };
  const fontFamily = fontMap[stored.font ?? "sans"] ?? fontMap.sans;
  const shadow = (surface.shadow as string) || "soft";
  return {
    "--theme-primary": colors.button || accent,
    "--theme-secondary": colors.link || accent,
    "--theme-accent": accent,
    "--theme-background": resolveStoredBg(stored),
    "--theme-surface": colors.card || "#ffffff",
    "--theme-text": colors.fg || "#111827",
    "--theme-text-secondary": colors.muted || "#64748b",
    "--theme-border": colors.border || "#e2e8f0",
    "--theme-error": "#dc2626",
    "--theme-success": "#16a34a",
    "--theme-warning": "#f59e0b",
    "--theme-font-heading": fontFamily,
    "--theme-font-body": fontFamily,
    "--theme-border-radius": radMap[stored.radius ?? "md"] ?? "8px",
    "--theme-border-width": `${(surface.borderWidth as number) ?? 1}px`,
    "--theme-shadow": shadowMap[shadow] ?? shadowMap.soft,
    "--theme-blur": (stored.effect || "").includes("glass") ? "16px" : "none",
  };
}
