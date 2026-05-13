import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { BlockEditorBlockSchema } from "@/features/block-editor/lib/validation";

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
  thumbnailUrl: z.string().url().optional().nullable(),
  themeId: z.number().int().positive().optional().nullable(),
  blocks: z.array(BlockEditorBlockSchema).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  previewInfo: z.record(z.string(), z.unknown()).optional(),
  isPremium: z.boolean().optional(),
  isActive: z.boolean().optional(),
  category: z.string().max(80).optional().nullable(),
  version: z.number().int().positive().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { templateId } = await params;
  const id = parseInt(templateId, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  const [template] = await db.select().from(templates).where(eq(templates.id, id));
  if (!template) return NextResponse.json({ error: "Şablon bulunamadı" }, { status: 404 });

  return NextResponse.json(template);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { templateId } = await params;
  const id = parseInt(templateId, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  const parsed = PatchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(templates)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(templates.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Şablon bulunamadı" }, { status: 404 });

  return NextResponse.json(updated);
}
