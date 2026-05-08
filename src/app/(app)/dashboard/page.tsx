import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, themes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyUrlButton } from "./copy-url-button";

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  info_missing: "Bilgi Eksik",
  studio_pending: "Stüdyo Bekliyor",
  in_design: "Tasarımda",
  preview_ready: "Önizleme Hazır",
  customer_revision: "Revizyon Bekliyor",
  approved: "Onaylandı",
  payment_pending: "Ödeme Bekliyor",
  paid: "Ödendi",
  published: "Yayında",
  paused: "Duraklatıldı",
  expired: "Süresi Doldu",
  cancelled: "İptal Edildi",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  info_missing: "bg-yellow-50 text-yellow-700",
  studio_pending: "bg-blue-50 text-blue-700",
  in_design: "bg-purple-50 text-purple-700",
  preview_ready: "bg-indigo-50 text-indigo-700",
  customer_revision: "bg-orange-50 text-orange-700",
  approved: "bg-teal-50 text-teal-700",
  payment_pending: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  published: "bg-green-100 text-green-800",
  paused: "bg-gray-100 text-gray-500",
  expired: "bg-red-50 text-red-600",
  cancelled: "bg-red-50 text-red-400",
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  restaurant_menu: "Restoran Menüsü",
  bio_link: "Bio Link",
  brand_bio: "Marka Bio",
  google_review: "Google Yorum",
  event_invitation: "Etkinlik Daveti",
  campaign_link: "Kampanya Linki",
};

const SUBDOMAIN_MAP: Record<string, string> = {
  m: "m.qrbir.com",
  b: "b.qrbir.com",
  r: "r.qrbir.com",
  e: "e.qrbir.com",
  go: "go.qrbir.com",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userProjects = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      projectType: projects.projectType,
      subdomainType: projects.subdomainType,
      status: projects.status,
      createdAt: projects.createdAt,
      themeName: themes.name,
    })
    .from(projects)
    .leftJoin(themes, eq(projects.themeId, themes.id))
    .where(eq(projects.userId, session.user.id))
    .orderBy(projects.createdAt);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projelerim</h1>
            <p className="text-gray-500 text-sm mt-1">
              Merhaba, {session.user.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Hesabım
            </Link>
            <Link
              href="/new"
              className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              + Yeni Proje
            </Link>
          </div>
        </div>

        {userProjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h2 className="font-semibold text-gray-700 mb-1">
              Henüz proje yok
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              İlk projenizi oluşturarak başlayın
            </p>
            <Link
              href="/new"
              className="bg-black text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Proje Oluştur
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userProjects.map((project) => (
              <Link
                key={project.id}
                href={
                  project.themeName
                    ? `/projects/${project.id}/edit`
                    : `/projects/${project.id}/theme`
                }
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between hover:shadow-sm hover:border-gray-300 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-gray-900 truncate">
                      {project.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        STATUS_COLORS[project.status] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_LABELS[project.status] ?? project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      {PROJECT_TYPE_LABELS[project.projectType] ??
                        project.projectType}
                    </span>
                    <span>·</span>
                    <span className="font-mono">
                      {SUBDOMAIN_MAP[project.subdomainType] ?? project.subdomainType}/
                      {project.slug}
                    </span>
                    {project.themeName && (
                      <>
                        <span>·</span>
                        <span>🎨 {project.themeName}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="ml-4 shrink-0 text-right space-y-1">
                  <div className="text-xs text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                  {project.status === "published" ? (
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs font-semibold text-green-600">
                        🟢 Yayında
                      </span>
                      <CopyUrlButton
                        url={`https://${SUBDOMAIN_MAP[project.subdomainType] ?? project.subdomainType}/${project.slug}`}
                      />
                    </div>
                  ) : !project.themeName ? (
                    <div className="text-xs text-blue-600">Tema seç →</div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
