import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { db } from "@/lib/db";
import { projects, projectContents, themes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { migrateContent } from "@/lib/content-migrator";
import { getSchemaModule } from "@/schemas";
import type { ThemeConfig } from "@/types/theme";

import { RestaurantMenuRenderer } from "@/components/renderers/restaurant-menu";
import { BioLinkRenderer } from "@/components/renderers/bio-link";
import { GoogleReviewRenderer } from "@/components/renderers/google-review";
import { BrandBioRenderer } from "@/components/renderers/brand-bio";
import { EventInvitationRenderer } from "@/components/renderers/event-invitation";

// --- Sabitler ---

const VALID_SUBDOMAINS = ["m", "b", "r", "e", "go"] as const;
type ValidSubdomain = (typeof VALID_SUBDOMAINS)[number];

const STATUS_GATE: Partial<
  Record<string, { icon: string; title: string; body: string }>
> = {
  draft: {
    icon: "🚧",
    title: "Bu sayfa henüz yayında değil",
    body: "İçerik düzenleniyor, kısa süre içinde yayına girecek.",
  },
  info_missing: {
    icon: "📝",
    title: "Bu sayfa henüz hazır değil",
    body: "Bilgiler tamamlanıyor.",
  },
  studio_pending: {
    icon: "🎨",
    title: "Bu sayfa tasarımda",
    body: "Tasarım tamamlanınca yayına girecek.",
  },
  in_design: {
    icon: "🎨",
    title: "Bu sayfa tasarımda",
    body: "Kısa süre içinde hazır olacak.",
  },
  preview_ready: {
    icon: "👀",
    title: "Bu sayfa incelemede",
    body: "Onay bekleniyor.",
  },
  customer_revision: {
    icon: "🔄",
    title: "Bu sayfa revizyon aşamasında",
    body: "Yakında yayına girecek.",
  },
  approved: {
    icon: "✅",
    title: "Bu sayfa onaylandı",
    body: "Ödeme tamamlanınca yayına girecek.",
  },
  payment_pending: {
    icon: "💳",
    title: "Ödeme bekleniyor",
    body: "Ödeme tamamlanınca yayına girecek.",
  },
  paid: {
    icon: "⏳",
    title: "Yayına alınıyor…",
    body: "Kısa süre içinde aktif olacak.",
  },
  paused: {
    icon: "⏸",
    title: "Bu sayfa geçici olarak duraklatıldı",
    body: "Yakında tekrar yayına girecek.",
  },
  expired: {
    icon: "⌛",
    title: "Bu sayfanın süresi doldu",
    body: "Abonelik yenilenmesi gerekiyor.",
  },
  cancelled: {
    icon: "❌",
    title: "Bu sayfa iptal edildi",
    body: "",
  },
};

// --- DB sorgusu (React.cache ile tek seferde çekilir) ---

const getPublicProject = cache(async (subdomain: string, slug: string) => {
  const [row] = await db
    .select({
      id: projects.id,
      title: projects.title,
      projectType: projects.projectType,
      subdomainType: projects.subdomainType,
      status: projects.status,
      isFree: projects.isFree,
      themeConfig: themes.themeConfigJson,
      contentJson: projectContents.contentJson,
      schemaVersion: projectContents.schemaVersion,
    })
    .from(projects)
    .leftJoin(themes, eq(projects.themeId, themes.id))
    .leftJoin(projectContents, eq(projectContents.projectId, projects.id))
    .where(
      and(
        eq(projects.subdomainType, subdomain as ValidSubdomain),
        eq(projects.slug, slug)
      )
    )
    .limit(1);

  return row ?? null;
});

// --- generateMetadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}): Promise<Metadata> {
  const { subdomain, slug } = await params;
  if (!VALID_SUBDOMAINS.includes(subdomain as ValidSubdomain)) {
    return { title: "Sayfa Bulunamadı" };
  }
  const row = await getPublicProject(subdomain, slug);
  if (!row) return { title: "Sayfa Bulunamadı | QRbir" };

  const noIndex = row.status !== "published";
  return {
    title: `${row.title} | QRbir`,
    robots: noIndex ? "noindex,nofollow" : "index,follow",
  };
}

// --- Sayfa ---

export default async function PublicPage({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}) {
  const { subdomain, slug } = await params;

  // Geçersiz subdomain
  if (!VALID_SUBDOMAINS.includes(subdomain as ValidSubdomain)) notFound();

  const row = await getPublicProject(subdomain, slug);
  if (!row) notFound();

  // Yayında değilse durum sayfası göster
  if (row.status !== "published") {
    const gate = STATUS_GATE[row.status];
    return (
      <StatusPage
        icon={gate?.icon ?? "🚧"}
        title={gate?.title ?? "Bu sayfa henüz yayında değil"}
        body={gate?.body ?? ""}
      />
    );
  }

  // İçerik yükle ve migrate et
  const mod = getSchemaModule(row.projectType);
  let content: unknown;

  if (row.contentJson && Object.keys(row.contentJson as object).length > 0) {
    const result = migrateContent(
      row.projectType,
      row.contentJson as Record<string, unknown>,
      row.schemaVersion ?? 1
    );
    content = result.data;
  } else {
    content = mod?.defaultContent ?? {};
  }

  // Tema fallback (temadan bağımsız çalışabilmeli)
  const themeConfig: ThemeConfig = (row.themeConfig as ThemeConfig) ?? {
    colors: { bg: "#ffffff", fg: "#111827", accent: "#3b82f6" },
    font: "sans",
    radius: "md",
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Renderer */}
      {row.projectType === "restaurant_menu" && (
        <RestaurantMenuRenderer
          content={content as Parameters<typeof RestaurantMenuRenderer>[0]["content"]}
          theme={themeConfig}
        />
      )}
      {row.projectType === "bio_link" && (
        <BioLinkRenderer
          content={content as Parameters<typeof BioLinkRenderer>[0]["content"]}
          theme={themeConfig}
        />
      )}
      {row.projectType === "google_review" && (
        <GoogleReviewRenderer
          content={content as Parameters<typeof GoogleReviewRenderer>[0]["content"]}
          theme={themeConfig}
        />
      )}
      {row.projectType === "brand_bio" && (
        <BrandBioRenderer
          content={content as Parameters<typeof BrandBioRenderer>[0]["content"]}
          theme={themeConfig}
        />
      )}
      {row.projectType === "event_invitation" && (
        <EventInvitationRenderer
          content={content as Parameters<typeof EventInvitationRenderer>[0]["content"]}
          theme={themeConfig}
        />
      )}
      {/* Desteklenmeyen tip */}
      {!["restaurant_menu", "bio_link", "google_review", "brand_bio", "event_invitation"].includes(
        row.projectType
      ) && (
        <StatusPage
          icon="🚧"
          title="Bu sayfa yakında hazır olacak"
          body="Bu ürün tipi için görüntüleme desteği geliştiriliyor."
        />
      )}

      {/* QRbir damgası — ücretsiz projeler için */}
      {row.isFree && <QRbirBadge />}
    </main>
  );
}

// --- Yardımcı bileşenler ---

function StatusPage({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        padding: "32px 20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "40px 32px",
          textAlign: "center",
          maxWidth: "360px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            color: "#111827",
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        {body && (
          <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
            {body}
          </div>
        )}
        <div style={{ marginTop: 28 }}>
          <a
            href="https://qrbir.com"
            style={{
              fontSize: 12,
              color: "#9ca3af",
              textDecoration: "none",
            }}
          >
            qrbir.com
          </a>
        </div>
      </div>
    </div>
  );
}

function QRbirBadge() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 50,
      }}
    >
      <a
        href="https://qrbir.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          borderRadius: "9999px",
          padding: "6px 12px",
          fontSize: 11,
          fontWeight: 600,
          textDecoration: "none",
          fontFamily: "system-ui, sans-serif",
          backdropFilter: "blur(8px)",
        }}
      >
        ⚡ qrbir.com
      </a>
    </div>
  );
}
