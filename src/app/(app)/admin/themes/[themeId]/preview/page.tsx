import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { themes, templates as adminTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getTemplate } from "@/lib/theme-editor/registry";
import { BIO_LINK_DEMO } from "@/themes/bio-link/fixtures";
import { RESTAURANT_MENU_DEMO } from "@/themes/restaurant-menu/fixtures";
import type { ThemeConfig } from "@/types/theme";
import type { StoredThemeConfig } from "@/lib/theme-editor/contract";
import { BlockContentRenderer } from "@/features/block-editor/components/BlockContentRenderer";
import { isBlockEditorContent } from "@/features/block-editor/types/content";
import type { Block } from "@/features/block-editor/types/database";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const DEMO_CONTENT: Record<string, unknown> = {
  bio_link: BIO_LINK_DEMO,
  brand_bio: BIO_LINK_DEMO,
  restaurant_menu: RESTAURANT_MENU_DEMO,
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  restaurant_menu: "Restoran Menü",
  bio_link: "Bio Link",
  brand_bio: "Marka Bio",
  google_review: "Google Yorum",
  event_invitation: "Etkinlik",
  campaign_link: "Kampanya",
};

export default async function ThemePreviewPage({
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

  const [theme] = await db.select().from(themes).where(eq(themes.id, id));
  if (!theme) notFound();

  // Admin template blocks preview
  const { templateId: adminTemplateIdStr } = await searchParams;
  const adminTemplateId = adminTemplateIdStr ? parseInt(adminTemplateIdStr, 10) : NaN;
  if (!isNaN(adminTemplateId)) {
    const [adminTemplate] = await db
      .select({ blocks: adminTemplates.blocks, name: adminTemplates.name })
      .from(adminTemplates)
      .where(eq(adminTemplates.id, adminTemplateId));

    if (adminTemplate) {
      const stored = theme.themeConfigJson as StoredThemeConfig;
      const cssVars = storedConfigToCssVars(stored);
      const bg = resolveStoredBg(stored);
      const blocks = Array.isArray(adminTemplate.blocks) ? (adminTemplate.blocks as Block[]) : [];
      const content = {
        editor: "qr1-blocks" as const,
        version: 1 as const,
        site: { title: adminTemplate.name, description: null, site_type: "bio_link" as const, theme: { colors: { background: bg } }, theme_id: String(id), settings: {} },
        blocks,
      };

      return (
        <div style={{ ...cssVars, background: bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
          <BlockContentRenderer content={content} />
        </div>
      );
    }
  }

  const stored = theme.themeConfigJson as StoredThemeConfig;
  const templateId = stored.templateId;

  if (!templateId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--color-fg-3)", fontSize: 14 }}>
          Bu tema kayıtlı bir template şablonuna bağlı değil.
        </p>
      </div>
    );
  }

  const template = getTemplate(templateId);
  if (!template) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--color-fg-3)", fontSize: 14 }}>
          Template bulunamadı: <code style={{ fontFamily: "monospace" }}>{templateId}</code>
        </p>
      </div>
    );
  }

  const demoContent = DEMO_CONTENT[theme.productType] ?? null;
  const editorContent = stored.editorContent;
  const config = { ...stored } as Record<string, unknown>;
  delete config.templateId;
  delete config.templateVersion;
  delete config.editorContent;
  const themeConfig: ThemeConfig = Object.keys(config).length
    ? (config as ThemeConfig)
    : template.defaultConfig;

  const rendered = isBlockEditorContent(editorContent)
    ? <BlockContentRenderer content={editorContent} />
    : template.render({
        content: demoContent,
        theme: themeConfig,
        mode: "public",
      });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, minHeight: "calc(100vh - 48px)" }}>
      {/* Header */}
      <div
        className="lum-glass"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          marginBottom: 24,
          borderRadius: 16,
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/admin/themes"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-fg-3)",
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            ← Temalar
          </Link>
          <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.08)" }} />
          <div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-fg-1)" }}>
              {theme.name}
            </span>
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                color: "var(--color-fg-4)",
                fontWeight: 400,
              }}
            >
              {PRODUCT_TYPE_LABELS[theme.productType] ?? theme.productType}
            </span>
          </div>
        </div>

        <Link
          href={`/admin/themes/${theme.id}/edit`}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: 10,
            background: "var(--gradient-violet)",
            boxShadow: "0 2px 8px rgba(124,109,255,0.3)",
          }}
        >
          Düzenle
        </Link>
      </div>

      {/* Preview area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingBottom: 40,
          gap: 12,
        }}
      >
        {/* Device label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--color-fg-4)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {template.viewport.baseWidth}px — Mobil önizleme
          </span>
        </div>

        {/* Phone frame */}
        <div
          style={{
            width: template.viewport.baseWidth,
            borderRadius: 32,
            overflow: "hidden",
            boxShadow:
              "0 0 0 8px #1a1a2e, 0 0 0 10px #2d2d4e, 0 24px 60px rgba(0,0,0,0.35)",
            background: "#fff",
            position: "relative",
          }}
        >
          {/* Status bar notch */}
          <div
            style={{
              height: 32,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 100,
                height: 16,
                borderRadius: 999,
                background: "#000",
                border: "1px solid #333",
              }}
            />
          </div>

          {/* Rendered content */}
          <div
            style={{
              width: template.viewport.baseWidth,
              maxHeight: 780,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {rendered}
          </div>

          {/* Home indicator */}
          <div
            style={{
              height: 24,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 4,
                borderRadius: 999,
                background: "rgba(255,255,255,0.3)",
              }}
            />
          </div>
        </div>

        {/* Template meta */}
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {template.capabilities.map((cap) => (
            <span
              key={cap}
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 20,
                background: "rgba(124,109,255,0.08)",
                color: "var(--color-accent-violet-deep)",
                border: "1px solid rgba(124,109,255,0.2)",
                fontWeight: 500,
              }}
            >
              {cap}
            </span>
          ))}
        </div>
      </div>
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
  const radius = stored.radius;
  const shadow = (surface.shadow as string) || "soft";
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
    "--theme-border-radius": radMap[radius ?? "md"] ?? "8px",
    "--theme-border-width": `${(surface.borderWidth as number) ?? 1}px`,
    "--theme-shadow": shadowMap[shadow] ?? shadowMap.soft,
    "--theme-blur": (stored.effect || "").includes("glass") ? "16px" : "none",
  };
}
