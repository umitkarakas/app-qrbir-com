import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, projectContents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getSchemaModule } from "@/schemas";
import { migrateContent } from "@/lib/content-migrator";

async function loadProject(projectId: number, userId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);
  return project ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (Number.isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const project = await loadProject(projectId, session.user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mod = getSchemaModule(project.projectType);
  if (!mod) {
    return NextResponse.json(
      { error: "Bu ürün tipi için içerik formu henüz desteklenmiyor" },
      { status: 501 }
    );
  }

  const [existing] = await db
    .select()
    .from(projectContents)
    .where(eq(projectContents.projectId, projectId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({
      content: mod.defaultContent,
      schemaVersion: mod.CURRENT_VERSION,
      isNew: true,
    });
  }

  // Lazy migration
  const result = migrateContent(
    project.projectType,
    existing.contentJson,
    existing.schemaVersion
  );

  return NextResponse.json({
    content: result.data,
    schemaVersion: result.schemaVersion,
    migrated: result.migrated,
    isNew: false,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (Number.isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const project = await loadProject(projectId, session.user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mod = getSchemaModule(project.projectType);
  if (!mod) {
    return NextResponse.json(
      { error: "Bu ürün tipi için içerik formu henüz desteklenmiyor" },
      { status: 501 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mod.schema.safeParse(body.content);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.format(),
      },
      { status: 422 }
    );
  }

  const [existing] = await db
    .select({ id: projectContents.id })
    .from(projectContents)
    .where(eq(projectContents.projectId, projectId))
    .limit(1);

  const now = new Date();

  if (existing) {
    await db
      .update(projectContents)
      .set({
        contentJson: parsed.data,
        schemaVersion: mod.CURRENT_VERSION,
        updatedAt: now,
      })
      .where(eq(projectContents.id, existing.id));
  } else {
    await db.insert(projectContents).values({
      projectId,
      contentJson: parsed.data,
      schemaVersion: mod.CURRENT_VERSION,
    });
  }

  // Proje updatedAt güncelle
  await db
    .update(projects)
    .set({ updatedAt: now })
    .where(eq(projects.id, projectId));

  return NextResponse.json({
    content: parsed.data,
    schemaVersion: mod.CURRENT_VERSION,
  });
}
