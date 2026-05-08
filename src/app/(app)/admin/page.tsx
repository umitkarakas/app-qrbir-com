import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, themes, studioOrders, users, pendingOrders } from "@/db/schema";
import { eq, desc, inArray, count, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProjectFilter } from "./project-filter";
import { AppHeader } from "@/components/layout/app-header";

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
    <>
      <AppHeader searchPlaceholder="Admin'de ara..." />

      {/* Başlık */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="lum-section-title">Admin Paneli</h1>
          <p className="lum-section-sub">Toplam {allProjects.length} proje</p>
        </div>
        <Link
          href="/admin/audit"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg-3)", textDecoration: "none", padding: "8px 14px", borderRadius: 10, background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.55)" }}
        >
          Audit Log →
        </Link>
      </div>

      {/* Özet kartlar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Toplam Proje", value: allProjects.length, icon: "📋" },
          { label: "Yayında", value: statusCounts["published"] ?? 0, icon: "🟢" },
          { label: "Kullanıcı", value: userCountRow?.total ?? 0, icon: "👤" },
          { label: "Görüntülenme", value: Number(viewCountRow?.total ?? 0).toLocaleString("tr-TR"), icon: "👁" },
          { label: "Bekleyen Ödeme", value: pendingOrderCountRow?.total ?? 0, icon: "💳" },
        ].map((stat) => (
          <div key={stat.label} className="lum-glass" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-fg-1)" }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "var(--color-fg-4)", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Durum dağılımı */}
      <div className="lum-glass" style={{ padding: "16px 20px", marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "var(--color-fg-2)" }}>Durum Dağılımı</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(statusCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([status, cnt]) => (
              <span key={status} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500, background: "rgba(255,255,255,0.5)", color: "var(--color-fg-2)", border: "1px solid rgba(255,255,255,0.6)" }}>
                {STATUS_LABELS[status] ?? status}: {cnt}
              </span>
            ))}
        </div>
      </div>

      {/* Studio talepleri — bekleyen */}
      {pendingStudioOrders.length > 0 && (
        <div className="lum-glass" style={{ padding: "16px 20px", marginBottom: 16, borderColor: "rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.06)" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "var(--color-accent-violet-deep)" }}>
            🎨 Bekleyen Studio Talepleri ({pendingStudioOrders.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingStudioOrders.map((order) => {
              const proj = allProjects.find((p) => p.id === order.projectId);
              return (
                <div key={order.id} className="lum-glass" style={{ padding: "10px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-fg-1)" }}>
                      {proj?.title ?? `Proje #${order.projectId}`}
                    </p>
                    {order.customerNote && (
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--color-fg-3)" }}>
                        &ldquo;{order.customerNote}&rdquo;
                      </p>
                    )}
                  </div>
                  <div style={{ flexShrink: 0, fontSize: 11, color: "var(--color-fg-4)", whiteSpace: "nowrap" }}>
                    {new Date(order.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Proje tablosu */}
      <ProjectFilter projects={allProjects} />
    </>
  );
}
