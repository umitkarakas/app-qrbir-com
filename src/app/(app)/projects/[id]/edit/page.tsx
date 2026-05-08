import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, projectContents, themes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSchemaModule } from "@/schemas";
import { migrateContent } from "@/lib/content-migrator";
import RestaurantMenuForm from "./restaurant-menu-form";
import BioLinkForm from "./bio-link-form";
import GoogleReviewForm from "./google-review-form";
import BrandBioForm from "./brand-bio-form";
import EventInvitationForm from "./event-invitation-form";
import { PublishBar } from "./publish-bar";
import { QrPanel } from "./qr-panel";
import { SlugEditor } from "./slug-editor";
import { TitleEditor } from "./title-editor";
import type { ThemeConfig } from "@/types/theme";

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-3xl mb-3">🚧</div>
            <h1 className="font-semibold text-gray-900 mb-1">
              Bu ürün tipi için içerik formu yakında
            </h1>
            <p className="text-gray-500 text-sm mb-5">
              {row.projectType} formu sonraki fazda eklenecek.
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
      row.projectType,
      existing.contentJson,
      existing.schemaVersion
    );
    initialContent = result.data;
  } else {
    initialContent = mod.defaultContent;
  }

  const themeConfig = row.themeConfig as ThemeConfig | null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Başlık + Nav */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <TitleEditor projectId={row.id} initial={row.title} />
            <SlugEditor
              projectId={row.id}
              initialSlug={row.slug}
              subdomainType={row.subdomainType}
            />
            <p className="text-gray-500 text-sm mt-1">
              İçerik bilgilerini doldurun
              {row.themeName && (
                <span className="ml-2 text-gray-400">
                  · 🎨 {row.themeName}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <Link
              href={`/projects/${row.id}/theme`}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Tema Değiştir
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              ← Panele Dön
            </Link>
          </div>
        </div>

        {/* Yayın durumu çubuğu */}
        <PublishBar
          projectId={row.id}
          initialStatus={row.status}
          subdomainType={row.subdomainType}
          slug={row.slug}
        />

        {/* QR Kod paneli */}
        <QrPanel
          projectId={row.id}
          publicUrl={`https://${row.subdomainType}.qrbir.com/${row.slug}`}
        />

        {/* Formlar */}
        {row.projectType === "restaurant_menu" && (
          <RestaurantMenuForm
            projectId={row.id}
            initial={initialContent as Parameters<typeof RestaurantMenuForm>[0]["initial"]}
            theme={themeConfig}
          />
        )}
        {row.projectType === "bio_link" && (
          <BioLinkForm
            projectId={row.id}
            initial={initialContent as Parameters<typeof BioLinkForm>[0]["initial"]}
            theme={themeConfig}
          />
        )}
        {row.projectType === "google_review" && (
          <GoogleReviewForm
            projectId={row.id}
            initial={initialContent as Parameters<typeof GoogleReviewForm>[0]["initial"]}
            theme={themeConfig}
          />
        )}
        {row.projectType === "brand_bio" && (
          <BrandBioForm
            projectId={row.id}
            initial={initialContent as Parameters<typeof BrandBioForm>[0]["initial"]}
            theme={themeConfig}
          />
        )}
        {row.projectType === "event_invitation" && (
          <EventInvitationForm
            projectId={row.id}
            initial={initialContent as Parameters<typeof EventInvitationForm>[0]["initial"]}
            theme={themeConfig}
          />
        )}
      </div>
    </div>
  );
}
