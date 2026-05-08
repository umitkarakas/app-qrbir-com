import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, themes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyUrlButton } from "./copy-url-button";
import { DeleteProjectButton } from "./delete-project-button";
import { QrDownloadButton } from "./qr-download-button";
import { AppHeader } from "@/components/layout/app-header";
import { LayoutGrid, Zap, Eye, Smartphone, Plus, MoreHorizontal, ExternalLink } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  info_missing: "Bilgi Eksik",
  studio_pending: "Stüdyo Bekliyor",
  in_design: "Tasarımda",
  preview_ready: "Önizleme Hazır",
  customer_revision: "Revizyon",
  approved: "Onaylandı",
  payment_pending: "Ödeme Bekliyor",
  paid: "Ödendi",
  published: "Yayında",
  paused: "Duraklatıldı",
  expired: "Süresi Doldu",
  cancelled: "İptal",
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  restaurant_menu: "Restoran Menüsü",
  bio_link: "Bio Link",
  brand_bio: "Marka Bio",
  google_review: "Google Yorum",
  event_invitation: "Etkinlik Daveti",
  campaign_link: "Kampanya",
};

const SUBDOMAIN_MAP: Record<string, string> = {
  m: "m.qrbir.com",
  b: "b.qrbir.com",
  r: "r.qrbir.com",
  e: "e.qrbir.com",
  go: "go.qrbir.com",
};

const TYPE_GRADIENT: Record<string, string> = {
  restaurant_menu: "var(--gradient-tile-peach)",
  bio_link: "var(--gradient-tile-violet)",
  brand_bio: "var(--gradient-tile-violet-fuchsia)",
  google_review: "var(--gradient-tile-sky)",
  event_invitation: "var(--gradient-tile-violet)",
  campaign_link: "var(--gradient-tile-sky)",
};

const TYPE_ICON: Record<string, string> = {
  restaurant_menu: "🍽",
  bio_link: "🔗",
  brand_bio: "✨",
  google_review: "⭐",
  event_invitation: "🎟",
  campaign_link: "🚀",
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
      viewCount: projects.viewCount,
      qrCount: projects.qrCount,
      createdAt: projects.createdAt,
      themeName: themes.name,
    })
    .from(projects)
    .leftJoin(themes, eq(projects.themeId, themes.id))
    .where(eq(projects.userId, session.user.id))
    .orderBy(projects.createdAt);

  const totalProjects = userProjects.length;
  const publishedCount = userProjects.filter((p) => p.status === "published").length;
  const totalViews = userProjects.reduce((sum, p) => sum + (p.viewCount ?? 0), 0);
  const totalScans = userProjects.reduce((sum, p) => sum + (p.qrCount ?? 0), 0);

  const metrics = [
    {
      label: "Toplam Proje",
      value: totalProjects.toString(),
      trend: publishedCount > 0 ? `${publishedCount} yayında` : "Henüz yayında yok",
      trendPositive: publishedCount > 0,
      icon: LayoutGrid,
      gradient: "var(--gradient-tile-violet)",
    },
    {
      label: "Yayındaki",
      value: publishedCount.toString(),
      trend: totalProjects > 0 ? `${Math.round((publishedCount / totalProjects) * 100)}% aktif` : "—",
      trendPositive: publishedCount > 0,
      icon: Zap,
      gradient: "var(--gradient-tile-sky)",
    },
    {
      label: "Görüntüleme",
      value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(),
      trend: totalViews > 0 ? "Tüm projeler" : "Henüz veri yok",
      trendPositive: totalViews > 0,
      icon: Eye,
      gradient: "var(--gradient-tile-violet-fuchsia)",
    },
    {
      label: "QR Tarama",
      value: totalScans >= 1000 ? `${(totalScans / 1000).toFixed(1)}K` : totalScans.toString(),
      trend: totalScans > 0 ? "Toplam tarama" : "Henüz tarama yok",
      trendPositive: totalScans > 0,
      icon: Smartphone,
      gradient: "var(--gradient-tile-peach)",
    },
  ];

  return (
    <>
      {/* Shared header */}
      <AppHeader
        userName={session.user.name ?? undefined}
        userEmail={session.user.email ?? undefined}
        searchPlaceholder="Proje ara..."
      />

      {/* Metric cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
        }}
      >
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="lum-glass lum-glass--hover"
              style={{ padding: 20, minHeight: 156, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div className="lum-tile" style={{ width: 46, height: 46, background: m.gradient }}>
                  <Icon size={19} />
                </div>
                <button style={{ display: "grid", placeItems: "center", width: 30, height: 30, border: 0, borderRadius: 10, background: "transparent", color: "var(--color-fg-4)", cursor: "pointer" }}>
                  <MoreHorizontal size={17} />
                </button>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-fg-3)" }}>{m.label}</p>
                <p style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 600, color: "var(--color-fg-1)", letterSpacing: 0 }}>{m.value}</p>
                <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600, color: m.trendPositive ? "var(--color-success)" : "var(--color-fg-4)" }}>{m.trend}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Projects */}
      <div className="lum-glass" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 className="lum-section-title">Projelerim</h1>
            <p className="lum-section-sub">{totalProjects} proje · {publishedCount} yayında</p>
          </div>
          <Link href="/new" className="lum-cta">
            <Plus size={15} />
            Yeni Proje
          </Link>
        </div>

        {userProjects.length === 0 ? (
          <div style={{ borderRadius: 20, border: "1.5px dashed rgba(124,109,255,0.25)", padding: "56px 24px", textAlign: "center", background: "rgba(255,255,255,0.25)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--color-fg-1)" }}>Henüz proje yok</h2>
            <p style={{ margin: "8px 0 24px", fontSize: 14, color: "var(--color-fg-3)" }}>İlk projenizi oluşturarak başlayın</p>
            <Link href="/new" className="lum-cta" style={{ display: "inline-flex", width: "auto" }}>
              <Plus size={15} />
              Proje Oluştur
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {userProjects.map((project) => {
              const editHref = project.themeName ? `/projects/${project.id}/edit` : `/projects/${project.id}/theme`;
              const gradient = TYPE_GRADIENT[project.projectType] ?? "var(--gradient-tile-violet)";
              const emoji = TYPE_ICON[project.projectType] ?? "📁";
              const typeLabel = PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType;
              const statusLabel = STATUS_LABELS[project.status] ?? project.status;
              const publicUrl = `https://${SUBDOMAIN_MAP[project.subdomainType] ?? project.subdomainType}/${project.slug}`;

              return (
                <div
                  key={project.id}
                  className="lum-project-row"
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 18, border: "1px solid rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.36)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.68)" }}
                >
                  <div className="lum-tile" style={{ width: 42, height: 42, background: gradient, fontSize: 19, flexShrink: 0 }}>{emoji}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <Link href={editHref} style={{ fontWeight: 600, fontSize: 14, color: "var(--color-fg-1)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {project.title}
                      </Link>
                      <span className={`status-${project.status}`} style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                        {statusLabel}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--color-fg-3)" }}>
                      <span>{typeLabel}</span>
                      <span style={{ opacity: 0.35 }}>·</span>
                      <span style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>{SUBDOMAIN_MAP[project.subdomainType] ?? project.subdomainType}/{project.slug}</span>
                      {project.themeName && <><span style={{ opacity: 0.35 }}>·</span><span>🎨 {project.themeName}</span></>}
                    </div>
                  </div>

                  {project.status === "published" && (
                    <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--color-fg-1)" }}>{project.viewCount ?? 0}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "var(--color-fg-4)" }}>görüntüleme</p>
                      </div>
                      {(project.qrCount ?? 0) > 0 && (
                        <div style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--color-fg-1)" }}>{project.qrCount}</p>
                          <p style={{ margin: 0, fontSize: 10, color: "var(--color-fg-4)" }}>QR</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ flexShrink: 0, fontSize: 11, color: "var(--color-fg-4)", fontWeight: 500, minWidth: 48, textAlign: "right" }}>
                    {new Date(project.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {!project.themeName && (
                      <Link href={`/projects/${project.id}/theme`} style={{ fontSize: 12, fontWeight: 600, color: "var(--color-accent-violet-deep)", textDecoration: "none", whiteSpace: "nowrap" }}>
                        Tema seç →
                      </Link>
                    )}
                    {project.status === "published" && (
                      <a href={publicUrl} target="_blank" rel="noopener noreferrer" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 11, border: "1px solid rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.55)", color: "var(--color-fg-2)", textDecoration: "none" }}>
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {project.status === "published" && <CopyUrlButton url={publicUrl} />}
                    {project.themeName && <QrDownloadButton projectId={project.id} slug={project.slug} />}
                    <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
