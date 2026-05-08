import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, pendingOrders, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { audit, getClientIp } from "@/lib/audit";
import { trySendMail, sendProjectPublishedEmail } from "@/lib/mailer";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (Number.isNaN(projectId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const [project] = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      subdomainType: projects.subdomainType,
      userId: projects.userId,
      status: projects.status,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.status === "published")
    return NextResponse.json({ error: "Zaten yayında" }, { status: 409 });

  // Projeyi yayınla
  await db
    .update(projects)
    .set({ status: "published", updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  // Pending order varsa tamamla
  await db
    .update(pendingOrders)
    .set({ status: "completed", updatedAt: new Date() })
    .where(
      and(
        eq(pendingOrders.projectId, projectId),
        eq(pendingOrders.status, "pending")
      )
    );

  const reqHeaders = await headers();
  await audit({
    userId: session.user.id,
    projectId,
    action: "project.activate",
    meta: { adminEmail: session.user.email, prevStatus: project.status },
    ip: getClientIp(reqHeaders),
  });

  // Müşteriye "projeniz yayına alındı" e-postası gönder
  const [customer] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, project.userId))
    .limit(1);

  if (customer?.email) {
    const appUrl = process.env.BETTER_AUTH_URL ?? "https://app.qrbir.com";
    const publicUrl = `https://${project.subdomainType}.qrbir.com/${project.slug}`;
    trySendMail(
      () =>
        sendProjectPublishedEmail({
          to: customer.email,
          projectTitle: project.title,
          publicUrl,
          qrDownloadUrl: `${appUrl}/projects/${project.id}/edit`,
        }),
      "project-published"
    );
  }

  return NextResponse.json({ ok: true });
}
