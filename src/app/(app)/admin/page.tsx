import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, themes, studioOrders, users, pendingOrders } from "@/db/schema";
import { eq, desc, inArray, count, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProjectFilter } from "./project-filter";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

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

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Admin kontrolü
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) {
    redirect("/dashboard");
  }

  const [allProjects, pendingStudioOrders, [userCountRow], [viewCountRow], [pendingOrderCountRow]] = await Promise.all([
    db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        projectType: projects.projectType,
        subdomainType: projects.subdomainType,
        status: projects.status,
        userId: projects.userId,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        themeName: themes.name,
      })
      .from(projects)
      .leftJoin(themes, eq(projects.themeId, themes.id))
      .orderBy(desc(projects.createdAt)),
    db
      .select({
        id: studioOrders.id,
        projectId: studioOrders.projectId,
        customerNote: studioOrders.customerNote,
        createdAt: studioOrders.createdAt,
      })
      .from(studioOrders)
      .where(inArray(studioOrders.status, ["pending", "in_progress"]))
      .orderBy(desc(studioOrders.createdAt)),
    // Toplam kullanıcı sayısı
    db.select({ total: count() }).from(users),
    // Toplam görüntülenme
    db.select({ total: sql<number>`coalesce(sum(${projects.viewCount}), 0)` }).from(projects),
    // Bekleyen ödeme siparişleri
    db.select({ total: count() }).from(pendingOrders).where(eq(pendingOrders.status, "pending")),
  ]);

  const statusCounts = allProjects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
            <p className="text-gray-500 text-sm mt-1">
              Toplam {allProjects.length} proje
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/audit"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Audit Log
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              ← Panele Dön
            </Link>
          </div>
        </div>

        {/* Özet kartlar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Toplam Proje", value: allProjects.length, icon: "📋" },
            { label: "Yayında", value: statusCounts["published"] ?? 0, icon: "🟢" },
            { label: "Kullanıcı", value: userCountRow?.total ?? 0, icon: "👤" },
            { label: "Görüntülenme", value: Number(viewCountRow?.total ?? 0).toLocaleString("tr-TR"), icon: "👁" },
            { label: "Bekleyen Ödeme", value: pendingOrderCountRow?.total ?? 0, icon: "💳" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 px-4 py-4">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Durum dağılımı */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Durum Dağılımı</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([status, cnt]) => (
                <span key={status} className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[status] ?? status}: {cnt}
                </span>
              ))}
          </div>
        </div>

        {/* Studio talepleri — bekleyen */}
        {pendingStudioOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6">
            <h2 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
              🎨 Bekleyen Studio Talepleri ({pendingStudioOrders.length})
            </h2>
            <div className="space-y-2">
              {pendingStudioOrders.map((order) => {
                const proj = allProjects.find((p) => p.id === order.projectId);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg border border-blue-100 px-4 py-3 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {proj?.title ?? `Proje #${order.projectId}`}
                      </p>
                      {order.customerNote && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          &ldquo;{order.customerNote}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Özet istatistikler */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {(["published", "studio_pending", "in_design", "payment_pending"] as const).map(
            (s) => (
              <div
                key={s}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3"
              >
                <div className="text-2xl font-bold text-gray-900">
                  {statusCounts[s] ?? 0}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {STATUS_LABELS[s]}
                </div>
              </div>
            )
          )}
        </div>

        {/* Proje tablosu — arama ve filtreleme ile */}
        <ProjectFilter projects={allProjects} />
      </div>
    </div>
  );
}
