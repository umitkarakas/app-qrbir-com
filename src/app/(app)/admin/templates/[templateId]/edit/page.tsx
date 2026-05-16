import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
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
  const themes: Theme[] = [];

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
