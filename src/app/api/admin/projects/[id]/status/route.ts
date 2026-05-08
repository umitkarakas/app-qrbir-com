import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { users } from "@/db/schema";
import {
  trySendMail,
  sendProjectPublishedEmail,
  sendPreviewReadyEmail,
  sendApprovedEmail,
} from "@/lib/mailer";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const VALID_STATUSES = [
  "draft",
  "info_missing",
  "studio_pending",
  "in_design",
  "preview_ready",
  "customer_revision",
  "approved",
  "payment_pending",
  "paid",
  "published",
  "paused",
  "expired",
  "cancelled",
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (Number.isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const newStatus = body.status as (typeof VALID_STATUSES)[number];

  // Mevcut proje + kullanıcı e-postası
  const [project] = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      subdomainType: projects.subdomainType,
      status: projects.status,
      userId: projects.userId,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(projects)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning({ id: projects.id, status: projects.status });

  // Kullanıcı e-postasını çek
  const [userRow] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, project.userId))
    .limit(1);

  const userEmail = userRow?.email;
  if (userEmail) {
    const domain = `${project.subdomainType}.qrbir.com`;
    const publicUrl = `https://${domain}/${project.slug}`;
    const editUrl = `https://app.qrbir.com/projects/${project.id}/edit`;

    if (newStatus === "published" && project.status !== "published") {
      trySendMail(
        () =>
          sendProjectPublishedEmail({
            to: userEmail,
            projectTitle: project.title,
            publicUrl,
            qrDownloadUrl: `https://app.qrbir.com/api/projects/${project.id}/qr?format=png&size=1200`,
          }),
        "admin-published"
      );
    } else if (newStatus === "preview_ready") {
      trySendMail(
        () =>
          sendPreviewReadyEmail({
            to: userEmail,
            projectTitle: project.title,
            editUrl,
          }),
        "preview-ready"
      );
    } else if (newStatus === "approved" || newStatus === "payment_pending") {
      trySendMail(
        () =>
          sendApprovedEmail({ to: userEmail, projectTitle: project.title }),
        "approved"
      );
    }
  }

  return NextResponse.json(updated);
}
