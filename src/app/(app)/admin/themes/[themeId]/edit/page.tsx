import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getTemplate, listTemplates } from "@/lib/theme-editor/registry";
import { BIO_LINK_DEMO } from "@/themes/bio-link/fixtures";
import { ThemeEditorClient } from "./theme-editor-client";
import { LegacyThemeActions } from "./legacy-theme-actions";
import type { ThemeConfig } from "@/types/theme";
import type { StoredThemeConfig } from "@/lib/theme-editor/contract";
import type { ProjectType } from "@/db/schema/projects";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const DEMO_CONTENT: Record<string, unknown> = {
  bio_link: BIO_LINK_DEMO,
  brand_bio: BIO_LINK_DEMO,
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  restaurant_menu: "Restoran Menü",
  bio_link: "Bio Link",
  brand_bio: "Marka Bio",
  google_review: "Google Yorum",
  event_invitation: "Etkinlik",
  campaign_link: "Kampanya",
};

export default async function ThemeEditPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) redirect("/dashboard");

  const { themeId } = await params;
  const id = parseInt(themeId, 10);
  if (isNaN(id)) notFound();

  const [theme] = await db.select().from(themes).where(eq(themes.id, id));
  if (!theme) notFound();

  const stored = theme.themeConfigJson as StoredThemeConfig;
  const templateId = stored.templateId;

  if (!templateId) {
    const availableTemplates = listTemplates(theme.productType as ProjectType);
    const colors = (stored as Record<string, unknown>).colors as Record<string, string> | undefined;

    return (
      <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 16px" }}>
        {/* Back */}
        <Link
          href="/admin/themes"
          style={{ fontSize: 13, color: "var(--color-fg-3)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}
        >
          ← Tüm Temalar
        </Link>

        <div className="lum-glass" style={{ padding: 28, borderRadius: 20 }}>
          {/* Badge + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, background: "rgba(245,158,11,0.1)", color: "#b45309", border: "1px solid rgba(245,158,11,0.25)" }}>
              Eski Sistem
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--color-fg-1)" }}>{theme.name}</span>
            <span style={{ fontSize: 12, color: "var(--color-fg-4)" }}>— {PRODUCT_TYPE_LABELS[theme.productType] ?? theme.productType}</span>
          </div>

          <p style={{ fontSize: 13, color: "var(--color-fg-2)", lineHeight: 1.6, margin: "0 0 20px" }}>
            Bu tema yeni şablon sistemi kurulmadan önce oluşturuldu. Online editör yalnızca şablona bağlı temalarla çalışır.
          </p>

          {/* Mevcut renkler */}
          {colors && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-fg-4)", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 10px" }}>
                Mevcut Renkler
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-fg-2)" }}>
                    <span style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid rgba(0,0,0,0.1)", display: "inline-block", flexShrink: 0, background: value.startsWith("linear") ? value : value }} />
                    {key}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "20px 0" }} />

          {/* Aksiyonlar */}
          <LegacyThemeActions
            themeId={theme.id}
            productType={theme.productType}
            availableTemplates={availableTemplates.map((t) => ({ id: t.id, name: t.name }))}
          />
        </div>
      </div>
    );
  }

  const template = getTemplate(templateId);
  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <p>Template bulunamadı: <code className="font-mono text-sm">{templateId}</code></p>
      </div>
    );
  }

  const demoContent = DEMO_CONTENT[theme.productType] ?? null;

  // themeConfigJson'dan ThemeConfig alanlarını çıkar (templateId/templateVersion hariç)
  const { templateId: _tid, templateVersion: _tv, ...config } = stored;
  const initialConfig: ThemeConfig = Object.keys(config).length
    ? (config as ThemeConfig)
    : template.defaultConfig;

  return (
    <ThemeEditorClient
      themeId={theme.id}
      initialName={theme.name}
      initialStatus={theme.status}
      initialConfig={initialConfig}
      template={template}
      demoContent={demoContent}
    />
  );
}
