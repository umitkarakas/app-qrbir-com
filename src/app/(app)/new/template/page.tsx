import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TemplatePickerClient } from "./template-picker-client";

const VALID_TYPES = new Set([
  "restaurant_menu",
  "bio_link",
  "brand_bio",
  "google_review",
  "event_invitation",
  "campaign_link",
]);

const TYPE_LABELS: Record<string, string> = {
  restaurant_menu: "Restoran Menüsü",
  bio_link: "Bio Link",
  brand_bio: "Marka Bio",
  google_review: "Google Yorum",
  event_invitation: "Etkinlik Daveti",
  campaign_link: "Kampanya Linki",
};

export default async function TemplatePickerPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; title?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { type, title } = await searchParams;

  if (!type || !VALID_TYPES.has(type) || !title || title.trim().length === 0) {
    redirect("/new");
  }

  const list = await db
    .select({
      id: templates.id,
      name: templates.name,
      description: templates.description,
      thumbnailUrl: templates.thumbnailUrl,
      isPremium: templates.isPremium,
    })
    .from(templates)
    .where(and(eq(templates.productType, type as never), eq(templates.isActive, true)))
    .orderBy(asc(templates.id));

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="lum-section-title">Şablon Seçin</h1>
          <p className="lum-section-sub">
            {TYPE_LABELS[type] ?? type} · {title.trim()}
          </p>
        </div>
        <a
          href="/new"
          style={{ fontSize: 13, color: "var(--color-fg-3)", textDecoration: "none" }}
        >
          ← Geri
        </a>
      </div>

      <TemplatePickerClient
        projectType={type}
        title={title.trim()}
        templates={list}
      />
    </>
  );
}
