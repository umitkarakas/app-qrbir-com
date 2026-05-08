import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, projectContents, themes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getSchemaModule } from "@/schemas";
import { migrateContent } from "@/lib/content-migrator";
import RestaurantMenuForm from "./restaurant-menu-form";
import BioLinkForm from "./bio-link-form";
import GoogleReviewForm from "./google-review-form";
import BrandBioForm from "./brand-bio-form";
import EventInvitationForm from "./event-invitation-form";
import CampaignLinkForm from "./campaign-link-form";
import { StudioRequestButton } from "./studio-request-button";
import { PublishBar } from "./publish-bar";
import { CheckoutButton } from "./checkout-button";
import { QrPanel } from "./qr-panel";
import { StickerPanel } from "./sticker-panel";
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
      viewCount: projects.viewCount,
      qrCount: projects.qrCount,
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
      <div className="lum-glass" style={{ maxWidth: 480, padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🚧</div>
        <h1 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "var(--color-fg-1)" }}>
          Bu ürün tipi için içerik formu yakında
        </h1>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--color-fg-3)" }}>
          {row.projectType} formu sonraki fazda eklenecek.
        </p>
        <Link href="/dashboard" className="lum-cta" style={{ display: "inline-flex" }}>
          Panele Dön
        </Link>
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
    <>
        {/* Başlık + Nav */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <TitleEditor projectId={row.id} initial={row.title} />
            <SlugEditor
              projectId={row.id}
              initialSlug={row.slug}
              subdomainType={row.subdomainType}
            />
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--color-fg-3)" }}>
              İçerik bilgilerini doldurun
              {row.themeName && (
                <span style={{ marginLeft: 8, color: "var(--color-fg-4)" }}>
                  · 🎨 {row.themeName}
                </span>
              )}
              {row.status === "published" && (
                <span style={{ marginLeft: 8, color: "var(--color-fg-4)" }}>
                  · 👁 {row.viewCount ?? 0} görüntüleme
                  {(row.qrCount ?? 0) > 0 && ` · 📱 ${row.qrCount} QR`}
                </span>
              )}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginTop: 4 }}>
            <Link
              href={`/projects/${row.id}/theme`}
              style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg-3)", textDecoration: "none", padding: "6px 12px", borderRadius: 10, background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.55)" }}
            >
              Tema Değiştir
            </Link>
            <Link
              href="/dashboard"
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--color-fg-3)", textDecoration: "none" }}
            >
              <ChevronLeft size={15} />
              Geri
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

        {/* Ödemeye geç — approved veya payment_pending durumunda */}
        {(row.status === "approved" || row.status === "payment_pending") && (
          <div className="lum-glass" style={{ padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderColor: "rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.06)" }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--color-fg-1)" }}>
                {row.status === "approved"
                  ? "✅ Projeniz onaylandı — ödeme ile yayına alabilirsiniz"
                  : "🕐 Ödeme bekleniyor"}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-fg-3)" }}>
                Ödeme tamamlandıktan sonra projeniz otomatik olarak yayına alınacak.
              </p>
            </div>
            <CheckoutButton
              projectId={row.id}
              orderType="digital_plan"
              label="Ödemeye Geç →"
            />
          </div>
        )}

        {/* Studio talebi — yayına geçmeden önce profesyonel hazırlık */}
        <StudioRequestButton
          projectId={row.id}
          currentStatus={row.status}
        />

        {/* QR Kod paneli */}
        <QrPanel
          projectId={row.id}
          publicUrl={`https://${row.subdomainType}.qrbir.com/${row.slug}`}
        />

        {/* Sticker / Stand önizleme */}
        <StickerPanel
          projectId={row.id}
          projectTitle={row.title}
          projectType={row.projectType}
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
        {row.projectType === "campaign_link" && (
          <CampaignLinkForm
            projectId={row.id}
            initial={initialContent as Parameters<typeof CampaignLinkForm>[0]["initial"]}
          />
        )}
    </>
  );
}
