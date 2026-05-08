import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, studioOrders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { trySendMail, sendStudioRequestEmail } from "@/lib/mailer";

const Body = z.object({
  note: z.string().max(1000).optional(),
});

const PROJECT_TYPE_LABELS: Record<string, string> = {
  restaurant_menu: "Restoran Menüsü",
  bio_link: "Bio Link",
  brand_bio: "Marka Bio",
  google_review: "Google Yorum",
  event_invitation: "Etkinlik Daveti",
  campaign_link: "Kampanya Linki",
};

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export async function POST(
  req: NextRequest,
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

  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Projeyi kontrol et
  const [project] = await db
    .select({
      id: projects.id,
      title: projects.title,
      projectType: projects.projectType,
      status: projects.status,
    })
    .from(projects)
    .where(
      and(eq(projects.id, projectId), eq(projects.userId, session.user.id))
    )
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Zaten studio_pending ise tekrar talep açma
  if (project.status === "studio_pending" || project.status === "in_design") {
    return NextResponse.json(
      { error: "Zaten aktif bir studio talebi mevcut" },
      { status: 409 }
    );
  }

  // Studio order oluştur
  await db.insert(studioOrders).values({
    projectId: project.id,
    userId: session.user.id,
    status: "pending",
    customerNote: body.data.note ?? null,
  });

  // Proje durumunu studio_pending yap
  await db
    .update(projects)
    .set({ status: "studio_pending", updatedAt: new Date() })
    .where(eq(projects.id, project.id));

  // Admin'e e-posta gönder
  if (ADMIN_EMAILS.length > 0) {
    trySendMail(
      () =>
        sendStudioRequestEmail({
          adminEmail: ADMIN_EMAILS[0],
          customerName: session.user.name ?? "—",
          customerEmail: session.user.email ?? "—",
          projectTitle: project.title,
          projectType:
            PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType,
          note: body.data.note,
          adminUrl: `${process.env.BETTER_AUTH_URL ?? "https://app.qrbir.com"}/admin`,
        }),
      "studio-request"
    );
  }

  return NextResponse.json({ ok: true });
}
