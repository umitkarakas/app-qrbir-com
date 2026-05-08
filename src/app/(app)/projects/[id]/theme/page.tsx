import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, themes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ThemePicker from "./theme-picker";

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
    .where(
      and(eq(projects.id, projectId), eq(projects.userId, session.user.id))
    )
    .limit(1);

  if (!project) notFound();

  const themeList = await db
    .select()
    .from(themes)
    .where(
      and(
        eq(themes.productType, project.projectType),
        eq(themes.status, "active")
      )
    )
    .orderBy(themes.isPremium, themes.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tema Seçin</h1>
            <p className="text-gray-500 text-sm mt-1">
              <span className="font-medium">{project.title}</span> için bir tema
              seçin
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Geri
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
      </div>
    </div>
  );
}
