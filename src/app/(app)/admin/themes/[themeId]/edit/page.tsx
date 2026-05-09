import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getTemplate } from "@/lib/theme-editor/registry";
import { BIO_LINK_DEMO } from "@/themes/bio-link/fixtures";
import { ThemeEditorClient } from "./theme-editor-client";
import type { ThemeConfig } from "@/types/theme";
import type { StoredThemeConfig } from "@/lib/theme-editor/contract";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const DEMO_CONTENT: Record<string, unknown> = {
  bio_link: BIO_LINK_DEMO,
  brand_bio: BIO_LINK_DEMO,
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
    // templateId yoksa legacy tema — basit mesaj göster
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <p>Bu tema kayıtlı bir template şablonuna bağlı değil.</p>
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
