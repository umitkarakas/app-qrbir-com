import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, approvalRequests, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import {
  trySendMail,
  sendApprovalRequestEmail,
} from "@/lib/mailer";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const Body = z.object({
  adminNote: z.string().max(500).optional(),
});

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
  if (Number.isNaN(projectId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  // Projeyi ve kullanıcıyı getir
  const [project] = await db
    .select({
      id: projects.id,
      title: projects.title,
      userId: projects.userId,
      status: projects.status,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Müşteri bilgisi
  const [customer] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, project.userId))
    .limit(1);

  // Önceki pending onay sayısı (versiyon numarası için)
  const previousApprovals = await db
    .select({ id: approvalRequests.id })
    .from(approvalRequests)
    .where(eq(approvalRequests.projectId, projectId))
    .orderBy(desc(approvalRequests.id));

  const versionNumber = previousApprovals.length + 1;
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün

  // Approval kaydı oluştur
  await db.insert(approvalRequests).values({
    projectId,
    token,
    versionNumber,
    status: "pending",
    adminNote: body.data.adminNote ?? null,
    expiresAt,
  });

  // Proje durumunu preview_ready yap
  await db
    .update(projects)
    .set({ status: "preview_ready", updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  const appUrl = process.env.BETTER_AUTH_URL ?? "https://app.qrbir.com";
  const approvalUrl = `${appUrl}/approve/${token}`;

  // Müşteriye e-posta
  if (customer?.email) {
    trySendMail(
      () =>
        sendApprovalRequestEmail({
          to: customer.email,
          customerName: customer.name ?? "Merhaba",
          projectTitle: project.title,
          approvalUrl,
          adminNote: body.data.adminNote,
        }),
      "approval-request"
    );
  }

  return NextResponse.json({ ok: true, approvalUrl, token });
}
