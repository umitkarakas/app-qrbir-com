import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, projectContents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSchemaModule } from "@/schemas";
import { migrateContent } from "@/lib/content-migrator";
import RestaurantMenuForm from "./restaurant-menu-form";
import BioLinkForm from "./bio-link-form";
import GoogleReviewForm from "./google-review-form";

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

  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.id, projectId), eq(projects.userId, session.user.id))
    )
    .limit(1);

  if (!project) notFound();

  const mod = getSchemaModule(project.projectType);

  if (!mod) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-3xl mb-3">🚧</div>
            <h1 className="font-semibold text-gray-900 mb-1">
              Bu ürün tipi için içerik formu yakında
            </h1>
            <p className="text-gray-500 text-sm mb-5">
              {project.projectType} formu sonraki fazda eklenecek.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Panele Dön
            </Link>
          </div>
        </div>
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
      project.projectType,
      existing.contentJson,
      existing.schemaVersion
    );
    initialContent = result.data;
  } else {
    initialContent = mod.defaultContent;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project.title}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              İçerik bilgilerini doldurun
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${project.id}/theme`}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Tema
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              ← Panele Dön
            </Link>
          </div>
        </div>

        {project.projectType === "restaurant_menu" && (
          <RestaurantMenuForm
            projectId={project.id}
            initial={initialContent as Parameters<typeof RestaurantMenuForm>[0]["initial"]}
          />
        )}
        {project.projectType === "bio_link" && (
          <BioLinkForm
            projectId={project.id}
            initial={initialContent as Parameters<typeof BioLinkForm>[0]["initial"]}
          />
        )}
        {project.projectType === "google_review" && (
          <GoogleReviewForm
            projectId={project.id}
            initial={initialContent as Parameters<typeof GoogleReviewForm>[0]["initial"]}
          />
        )}
      </div>
    </div>
  );
}
