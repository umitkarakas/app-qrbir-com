import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

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

// GET /api/admin/themes/[themeId]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ themeId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { themeId } = await params;
  const id = parseInt(themeId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  const [theme] = await db.select().from(themes).where(eq(themes.id, id));
  if (!theme) return NextResponse.json({ error: "Tema bulunamadı" }, { status: 404 });

  return NextResponse.json(theme);
}

const PatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  isFree: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  previewImageUrl: z.string().url().optional().nullable(),
  themeConfigJson: z.record(z.string(), z.unknown()).optional(),
});

// PATCH /api/admin/themes/[themeId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ themeId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { themeId } = await params;
  const id = parseInt(themeId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  const body = await request.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.isFree !== undefined) updates.isFree = parsed.data.isFree;
  if (parsed.data.isPremium !== undefined) updates.isPremium = parsed.data.isPremium;
  if (parsed.data.previewImageUrl !== undefined) updates.previewImageUrl = parsed.data.previewImageUrl;
  if (parsed.data.themeConfigJson !== undefined) updates.themeConfigJson = parsed.data.themeConfigJson;

  const [updated] = await db
    .update(themes)
    .set(updates)
    .where(eq(themes.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Tema bulunamadı" }, { status: 404 });

  return NextResponse.json(updated);
}

// DELETE /api/admin/themes/[themeId] — soft delete (archived)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ themeId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { themeId } = await params;
  const id = parseInt(themeId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  const [updated] = await db
    .update(themes)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(themes.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Tema bulunamadı" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
