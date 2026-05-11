import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, projectContents, themes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSchemaModule } from "@/schemas";
import { migrateContent } from "@/lib/content-migrator";
import { BlockEditorClient } from "./block-editor-client";
import {
  createBlocksFromContent,
  createEditorSite,
  createThemeList,
  type EditorProject,
} from "@/features/block-editor/types/content";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (Number.isNaN(projectId)) notFound();

  const [row] = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      projectType: projects.projectType,
      subdomainType: projects.subdomainType,
      status: projects.status,
      viewCount: projects.viewCount,
      qrCount: projects.qrCount,
      userId: projects.userId,
      themeConfig: themes.themeConfigJson,
      themeName: themes.name,
    })
    .from(projects)
    .leftJoin(themes, eq(projects.themeId, themes.id))
    .where(
      and(eq(projects.id, projectId), eq(projects.userId, session.user.id))
    )
    .limit(1);

  if (!row) notFound();

  const mod = getSchemaModule(row.projectType);

  if (!mod) {
    return (
      <div className="lum-glass" style={{ maxWidth: 480, padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🚧</div>
        <h1 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "var(--color-fg-1)" }}>
          Bu ürün tipi için içerik formu yakında
        </h1>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--color-fg-3)" }}>
          {row.projectType} formu sonraki fazda eklenecek.
        </p>
        <Link href="/dashboard" className="lum-cta" style={{ display: "inline-flex" }}>
          Panele Dön
        </Link>
      </div>
    );
  }

  const [existing] = await db
    .select()
    .from(projectContents)
    .where(eq(projectContents.projectId, projectId))
    .limit(1);

  let initialContent: unknown;
  if (existing) {
    const result = migrateContent(
      row.projectType,
      existing.contentJson,
      existing.schemaVersion
    );
    initialContent = result.data;
  } else {
    initialContent = mod.defaultContent;
  }

  const project: EditorProject = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    projectType: row.projectType,
    subdomainType: row.subdomainType,
    status: row.status,
    viewCount: row.viewCount,
    qrCount: row.qrCount,
    themeName: row.themeName,
  };

  return (
    <BlockEditorClient
      project={project}
      site={createEditorSite(project, initialContent)}
      blocks={createBlocksFromContent(project, initialContent)}
      themes={createThemeList()}
    />
  );
}
