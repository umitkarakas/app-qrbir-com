import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, themes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ThemePicker from "./theme-picker";
import { ChevronLeft } from "lucide-react";

export default async function ThemeSelectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (Number.isNaN(projectId)) notFound();

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) notFound();

  const themeList = await db
    .select()
    .from(themes)
    .where(and(eq(themes.productType, project.projectType), eq(themes.status, "active")))
    .orderBy(themes.isPremium, themes.id);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="lum-section-title">Tema Seçin</h1>
          <p className="lum-section-sub">
            <strong style={{ color: "var(--color-fg-2)" }}>{project.title}</strong> için bir tasarım seçin
          </p>
        </div>
        <Link
          href="/dashboard"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--color-fg-3)", textDecoration: "none" }}
        >
          <ChevronLeft size={15} />
          Geri
        </Link>
      </div>

      <ThemePicker
        projectId={project.id}
        currentThemeId={project.themeId ?? null}
        themes={themeList.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          previewImageUrl: t.previewImageUrl,
          isFree: t.isFree,
          isPremium: t.isPremium,
          themeConfigJson: t.themeConfigJson as Record<string, unknown>,
        }))}
      />
    </>
  );
}
