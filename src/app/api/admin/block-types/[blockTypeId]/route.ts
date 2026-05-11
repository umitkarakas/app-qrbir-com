import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blockTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
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

const PatchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().min(1).max(80).optional(),
  category: z.enum(["common", "menu", "invitation", "bio_link"]).optional(),
  isPro: z.boolean().optional(),
  allowedSiteTypes: z.array(z.string().min(1)).optional(),
  isEnabled: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ blockTypeId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { blockTypeId } = await params;
  const parsed = PatchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(blockTypes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(blockTypes.id, blockTypeId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Blok bulunamadı" }, { status: 404 });

  return NextResponse.json(updated);
}
