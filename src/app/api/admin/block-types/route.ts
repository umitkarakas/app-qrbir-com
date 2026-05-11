import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blockTypes } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) return null;
  return session;
}

const CategorySchema = z.enum(["common", "menu", "invitation", "bio_link"]);

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const category = request.nextUrl.searchParams.get("category");
  const enabled = request.nextUrl.searchParams.get("enabled");

  const conditions = [];
  const parsedCategory = CategorySchema.safeParse(category);
  if (parsedCategory.success) {
    conditions.push(eq(blockTypes.category, parsedCategory.data));
  }
  if (enabled === "true" || enabled === "false") {
    conditions.push(eq(blockTypes.isEnabled, enabled === "true"));
  }

  const list = await db
    .select()
    .from(blockTypes)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(blockTypes.sortOrder), asc(blockTypes.name));

  return NextResponse.json(list);
}

const CreateSchema = z.object({
  blockType: z.string().min(1).max(80),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().min(1).max(80),
  category: CategorySchema,
  isPro: z.boolean().default(false),
  allowedSiteTypes: z.array(z.string().min(1)).default([]),
  isEnabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = CreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [created] = await db
    .insert(blockTypes)
    .values(parsed.data)
    .returning();

  return NextResponse.json(created, { status: 201 });
}
