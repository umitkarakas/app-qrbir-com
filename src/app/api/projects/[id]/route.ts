import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, themes } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { trySendMail, sendProjectPublishedEmail } from "@/lib/mailer";
import { revalidatePath } from "next/cache";

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

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PATCH(
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

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Sahiplik kontrolü
  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: Partial<typeof projects.$inferInsert> = {};

  if (typeof body.themeId === "number") {
    // Tema'nın varlığını ve project_type uyumunu kontrol et
    const [theme] = await db
      .select()
      .from(themes)
      .where(eq(themes.id, body.themeId))
      .limit(1);

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 400 });
    }
    if (theme.productType !== existing.projectType) {
      return NextResponse.json(
        { error: "Theme product_type mismatch" },
        { status: 400 }
      );
    }
    updates.themeId = body.themeId;
  }

  if (typeof body.title === "string" && body.title.trim().length > 0) {
    updates.title = body.title.trim();
  }

  // Slug güncelleme
  if (typeof body.slug === "string") {
    const slug = body.slug.toLowerCase().trim().replace(/\s+/g, "-");
    // Format: en az 2 karakter, sadece a-z, 0-9, tire
    if (!/^[a-z0-9][a-z0-9-]{0,58}[a-z0-9]$|^[a-z0-9]{1,2}$/.test(slug)) {
      return NextResponse.json(
        { error: "Geçersiz slug: sadece küçük harf, rakam ve tire kullanılabilir (en az 2 karakter)" },
        { status: 400 }
      );
    }
    // Aynı subdomain'de çakışma kontrolü
    const [conflict] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.subdomainType, existing.subdomainType),
          eq(projects.slug, slug),
          ne(projects.id, projectId)
        )
      )
      .limit(1);
    if (conflict) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanımda" },
        { status: 409 }
      );
    }
    updates.slug = slug;
  }

  // Kullanıcı tarafından değiştirilebilir status geçişleri
  const ALLOWED_USER_STATUSES = ["published", "draft", "paused"] as const;
  if (
    typeof body.status === "string" &&
    ALLOWED_USER_STATUSES.includes(body.status as (typeof ALLOWED_USER_STATUSES)[number])
  ) {
    updates.status = body.status as typeof projects.$inferInsert["status"];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid updates" }, { status: 400 });
  }

  updates.updatedAt = new Date();

  const wasPublished = existing.status !== "published";
  const [updated] = await db
    .update(projects)
    .set(updates)
    .where(eq(projects.id, projectId))
    .returning();

  // Yayınlandı bildirimi
  if (wasPublished && updates.status === "published" && session.user.email) {
    const slug = updates.slug ?? existing.slug;
    const domain = `${existing.subdomainType}.qrbir.com`;
    const publicUrl = `https://${domain}/${slug}`;
    trySendMail(
      () =>
        sendProjectPublishedEmail({
          to: session.user.email!,
          projectTitle: updates.title ?? existing.title,
          publicUrl,
          qrDownloadUrl: `https://app.qrbir.com/api/projects/${projectId}/qr?format=png&size=1200`,
        }),
      "project-published"
    );
  }

  // On-demand revalidation: pub sayfasını temizle (slug değişmiş olabilir)
  const currentSlug = updates.slug ?? existing.slug;
  revalidatePath(`/pub/${existing.subdomainType}/${currentSlug}`);
  if (updates.slug && updates.slug !== existing.slug) {
    revalidatePath(`/pub/${existing.subdomainType}/${existing.slug}`);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (Number.isNaN(projectId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const [project] = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      subdomainType: projects.subdomainType,
      status: projects.status,
      userId: projects.userId,
    })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Yayındaki projeyi silmek için onay gerekir — API'den geliyor, onay zaten frontend'de alındı
  await db.delete(projects).where(eq(projects.id, projectId));

  // Pub cache'ini temizle
  revalidatePath(`/pub/${project.subdomainType}/${project.slug}`);

  return NextResponse.json({ ok: true });
}
