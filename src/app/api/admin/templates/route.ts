import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { BlockEditorBlockSchema } from "@/features/block-editor/lib/validation";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const VALID_PRODUCT_TYPES = [
  "restaurant_menu",
  "bio_link",
  "brand_bio",
  "google_review",
  "event_invitation",
  "campaign_link",
] as const;

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) return null;
  return session;
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const productType = request.nextUrl.searchParams.get("productType");
  const active = request.nextUrl.searchParams.get("active");

  const conditions = [];
  if (productType && VALID_PRODUCT_TYPES.includes(productType as (typeof VALID_PRODUCT_TYPES)[number])) {
    conditions.push(eq(templates.productType, productType as (typeof VALID_PRODUCT_TYPES)[number]));
  }
  if (active === "true" || active === "false") {
    conditions.push(eq(templates.isActive, active === "true"));
  }

  const list = await db
    .select()
    .from(templates)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(templates.id));

  return NextResponse.json(list);
}

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  productType: z.enum(VALID_PRODUCT_TYPES),
  thumbnailUrl: z.string().url().optional().nullable(),
  themeId: z.number().int().positive().optional().nullable(),
  blocks: z.array(BlockEditorBlockSchema).default([]),
  settings: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).default({}),
  previewInfo: z.record(z.string(), z.unknown()).default({}),
  isPremium: z.boolean().default(false),
  isActive: z.boolean().default(true),
  category: z.string().max(80).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = CreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [created] = await db.insert(templates).values(parsed.data).returning();
  return NextResponse.json(created, { status: 201 });
}
