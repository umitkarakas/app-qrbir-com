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
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  LayoutGrid,
  Zap,
  Eye,
  Smartphone,
  Search,
  Bell,
  ChevronDown,
  Plus,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";

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

  const initials = session.user.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const isAdmin = (session.user as { role?: string }).role === "admin";

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
      label: "Toplam Görüntüleme",
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
    <div
      className="lum-page"
      style={{ position: "relative", padding: 24, overflow: "hidden" }}
    >
      {/* Decorative orbs */}
      <div className="lum-bgdecor">
        <div className="lum-orb lum-orb--violet" />
        <div className="lum-orb lum-orb--sky" />
        <div className="lum-orb lum-orb--peach" />
        <div className="lum-streak" />
      </div>

      {/* App shell */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <AppSidebar
          isAdmin={isAdmin}
          userName={session.user.name ?? undefined}
          userEmail={session.user.email ?? undefined}
        />

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Header */}
          <header style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              className="lum-glass"
              style={{
                flex: 1,
                height: 56,
                borderRadius: "var(--radius-card)",
                display: "flex",
                alignItems: "center",
                padding: "0 18px",
                gap: 12,
                boxShadow: "var(--shadow-search)",
              }}
            >
              <Search size={18} style={{ color: "var(--color-fg-4)", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "var(--color-fg-4)", flex: 1 }}>
                Proje ara...
              </span>
              <span
                style={{
                  padding: "5px 11px",
                  borderRadius: "var(--radius-chip)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.65)",
                  boxShadow: "var(--inset-top-edge)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-fg-3)",
                }}
              >
                ⌘ K
              </span>
            </div>

            <div
              className="lum-glass"
              style={{
                height: 56,
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: "var(--shadow-search)",
              }}
            >
              <button
                style={{
                  position: "relative",
                  display: "grid",
                  placeItems: "center",
                  width: 38,
                  height: 38,
                  borderRadius: "var(--radius-control)",
                  border: 0,
                  background: "rgba(255,255,255,0.55)",
                  color: "var(--color-fg-2)",
                  cursor: "pointer",
                }}
              >
                <Bell size={18} />
                <span
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: "var(--color-accent-lilac)",
                    border: "2px solid #fff",
                  }}
                />
              </button>
              <span style={{ width: 1, height: 28, background: "rgba(148,163,184,0.4)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  className="lum-avatar"
                  style={{ width: 38, height: 38, fontSize: 12 }}
                >
                  {initials}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--color-fg-1)" }}>
                    {session.user.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--color-fg-3)" }}>
                    {session.user.email}
                  </p>
                </div>
                <ChevronDown size={14} style={{ color: "var(--color-fg-4)" }} />
              </div>
            </div>
          </header>

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
                  style={{ padding: 20, minHeight: 160, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div
                      className="lum-tile"
                      style={{ width: 48, height: 48, background: m.gradient }}
                    >
                      <Icon size={20} />
                    </div>
                    <button
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: 32,
                        height: 32,
                        border: 0,
                        borderRadius: 12,
                        background: "transparent",
                        color: "var(--color-fg-4)",
                        cursor: "pointer",
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-fg-3)" }}>
                      {m.label}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 600, color: "var(--color-fg-1)", letterSpacing: 0 }}>
                      {m.value}
                    </p>
                    <p style={{ margin: "10px 0 0", fontSize: 13, fontWeight: 600, color: m.trendPositive ? "var(--color-success)" : "var(--color-fg-4)" }}>
                      {m.trend}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Projects section */}
          <div
            className="lum-glass"
            style={{ padding: 28, flex: 1 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "var(--color-fg-1)", letterSpacing: 0 }}>
                  Projelerim
                </h1>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-fg-3)" }}>
                  {totalProjects} proje · {publishedCount} yayında
                </p>
              </div>
              <Link href="/new" className="lum-cta" style={{ fontSize: 14 }}>
                <Plus size={16} />
                Yeni Proje
              </Link>
            </div>

            {userProjects.length === 0 ? (
              <div
                style={{
                  borderRadius: 20,
                  border: "1.5px dashed rgba(124,109,255,0.25)",
                  padding: "64px 24px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.25)",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--color-fg-1)" }}>
                  Henüz proje yok
                </h2>
                <p style={{ margin: "8px 0 24px", fontSize: 14, color: "var(--color-fg-3)" }}>
                  İlk projenizi oluşturarak başlayın
                </p>
                <Link href="/new" className="lum-cta" style={{ display: "inline-flex", width: "auto" }}>
                  <Plus size={16} />
                  Proje Oluştur
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {userProjects.map((project) => {
                  const editHref = project.themeName
                    ? `/projects/${project.id}/edit`
                    : `/projects/${project.id}/theme`;
                  const gradient = TYPE_GRADIENT[project.projectType] ?? "var(--gradient-tile-violet)";
                  const emoji = TYPE_ICON[project.projectType] ?? "📁";
                  const typeLabel = PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType;
                  const statusLabel = STATUS_LABELS[project.status] ?? project.status;
                  const statusClass = `status-${project.status}`;
                  const publicUrl = `https://${SUBDOMAIN_MAP[project.subdomainType] ?? project.subdomainType}/${project.slug}`;

                  return (
                    <div
                      key={project.id}
                      className="lum-project-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "14px 16px",
                        borderRadius: 20,
                        border: "1px solid rgba(255,255,255,0.55)",
                        background: "rgba(255,255,255,0.36)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.68)",
                      }}
                    >
                      {/* Icon tile */}
                      <div
                        className="lum-tile"
                        style={{ width: 44, height: 44, background: gradient, fontSize: 20, flexShrink: 0 }}
                      >
                        {emoji}
                      </div>

                      {/* Title + meta */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <Link
                            href={editHref}
                            style={{
                              fontWeight: 600,
                              fontSize: 15,
                              color: "var(--color-fg-1)",
                              textDecoration: "none",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {project.title}
                          </Link>
                          <span
                            className={statusClass}
                            style={{
                              padding: "3px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--color-fg-3)" }}>
                          <span>{typeLabel}</span>
                          <span style={{ opacity: 0.4 }}>·</span>
                          <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11 }}>
                            {SUBDOMAIN_MAP[project.subdomainType] ?? project.subdomainType}/{project.slug}
                          </span>
                          {project.themeName && (
                            <>
                              <span style={{ opacity: 0.4 }}>·</span>
                              <span>🎨 {project.themeName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      {project.status === "published" && (
                        <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0 }}>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--color-fg-1)" }}>
                              {project.viewCount ?? 0}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: "var(--color-fg-4)" }}>görüntüleme</p>
                          </div>
                          {(project.qrCount ?? 0) > 0 && (
                            <div style={{ textAlign: "center" }}>
                              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--color-fg-1)" }}>
                                {project.qrCount}
                              </p>
                              <p style={{ margin: 0, fontSize: 11, color: "var(--color-fg-4)" }}>QR tarama</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Date */}
                      <div
                        style={{
                          flexShrink: 0,
                          fontSize: 12,
                          color: "var(--color-fg-4)",
                          fontWeight: 500,
                          minWidth: 56,
                          textAlign: "right",
                        }}
                      >
                        {new Date(project.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {!project.themeName && (
                          <Link
                            href={`/projects/${project.id}/theme`}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--color-accent-violet-deep)",
                              textDecoration: "none",
                            }}
                          >
                            Tema seç →
                          </Link>
                        )}
                        {project.status === "published" && (
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "grid",
                              placeItems: "center",
                              width: 34,
                              height: 34,
                              borderRadius: 12,
                              border: "1px solid rgba(255,255,255,0.65)",
                              background: "rgba(255,255,255,0.55)",
                              color: "var(--color-fg-2)",
                              textDecoration: "none",
                            }}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {project.status === "published" && (
                          <CopyUrlButton url={publicUrl} />
                        )}
                        {project.themeName && (
                          <QrDownloadButton projectId={project.id} slug={project.slug} />
                        )}
                        <DeleteProjectButton
                          projectId={project.id}
                          projectTitle={project.title}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
