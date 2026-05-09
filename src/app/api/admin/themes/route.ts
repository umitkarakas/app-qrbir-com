import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { listTemplates } from "@/lib/theme-editor/registry";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) return null;
  return session;
}

const VALID_PRODUCT_TYPES = [
  "restaurant_menu",
  "bio_link",
  "brand_bio",
  "google_review",
  "event_invitation",
  "campaign_link",
] as const;

// GET /api/admin/themes — tüm temaları listele (product type + status filtresi)
export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const productType = request.nextUrl.searchParams.get("productType");
  const status = request.nextUrl.searchParams.get("status");

  const conditions = [];
  if (productType && VALID_PRODUCT_TYPES.includes(productType as (typeof VALID_PRODUCT_TYPES)[number])) {
    conditions.push(eq(themes.productType, productType as (typeof VALID_PRODUCT_TYPES)[number]));
  }
  if (status && ["draft", "active", "archived"].includes(status)) {
    conditions.push(eq(themes.status, status as "draft" | "active" | "archived"));
  }

  const list = await db
    .select()
    .from(themes)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(themes.productType, themes.id);

  return NextResponse.json(list);
}

// GET /api/admin/themes?templates=1 — kayıtlı template listesi (registry'den)
// POST /api/admin/themes — yeni tema oluştur
const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  productType: z.enum(VALID_PRODUCT_TYPES),
  templateId: z.string().min(1),
  isFree: z.boolean().default(true),
  isPremium: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, productType, templateId, isFree, isPremium } = parsed.data;

  // Template registry'de var mı?
  const template = listTemplates(productType).find((t) => t.id === templateId);
  if (!template) {
    return NextResponse.json({ error: "Template bulunamadı" }, { status: 400 });
  }

  // Slug üret
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);

  const initialConfig = {
    ...template.defaultConfig,
    templateId: template.id,
    templateVersion: template.version,
  };

  const [created] = await db
    .insert(themes)
    .values({
      name,
      productType,
      slug: `${slug}-${Date.now()}`,
      status: "draft",
      isFree,
      isPremium,
      themeConfigJson: initialConfig,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
