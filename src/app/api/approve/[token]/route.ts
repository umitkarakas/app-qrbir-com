import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { approvalRequests, projects, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  trySendMail,
  sendRevisionRequestedEmail,
  sendApprovedEmail,
} from "@/lib/mailer";
import { audit, getClientIp } from "@/lib/audit";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const Body = z.object({
  decision: z.enum(["approve", "revision"]),
  note: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  // Token ile approval_request bul
  const [approval] = await db
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.token, token))
    .limit(1);

  if (!approval) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (approval.status !== "pending") {
    return NextResponse.json({ error: "Bu onay linki zaten kullanıldı" }, { status: 409 });
  }
  if (approval.expiresAt && new Date() > approval.expiresAt) {
    await db
      .update(approvalRequests)
      .set({ status: "expired" })
      .where(eq(approvalRequests.id, approval.id));
    return NextResponse.json({ error: "Bu onay linkinin süresi doldu" }, { status: 410 });
  }

  const { decision, note } = body.data;
  const newApprovalStatus = decision === "approve" ? "approved" : "revision";
  const newProjectStatus = decision === "approve" ? "approved" : "customer_revision";

  // Approval güncelle
  await db
    .update(approvalRequests)
    .set({
      status: newApprovalStatus,
      customerNote: note ?? null,
      respondedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(approvalRequests.id, approval.id));

  // Proje durumunu güncelle
  await db
    .update(projects)
    .set({ status: newProjectStatus, updatedAt: new Date() })
    .where(eq(projects.id, approval.projectId));

  // E-posta bildirimleri
  const [project] = await db
    .select({ title: projects.title, userId: projects.userId })
    .from(projects)
    .where(eq(projects.id, approval.projectId))
    .limit(1);

  const [customer] = project
    ? await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, project.userId))
        .limit(1)
    : [];

  const appUrl = process.env.BETTER_AUTH_URL ?? "https://app.qrbir.com";

  if (decision === "approve" && customer?.email) {
    trySendMail(
      () =>
        sendApprovedEmail({
          to: customer.email,
          projectTitle: project?.title ?? "",
        }),
      "customer-approved"
    );
  }

  if (decision === "revision" && ADMIN_EMAILS.length > 0) {
    trySendMail(
      () =>
        sendRevisionRequestedEmail({
          adminEmail: ADMIN_EMAILS[0],
          customerName: customer?.name ?? "Müşteri",
          projectTitle: project?.title ?? "",
          note,
          adminUrl: `${appUrl}/admin`,
        }),
      "revision-requested"
    );
  }

  await audit({
    userId: project?.userId ?? null,
    projectId: approval.projectId,
    action: decision === "approve" ? "approval.approve" : "approval.revision",
    meta: { token, versionNumber: approval.versionNumber, note: note ?? null },
    ip: getClientIp(req.headers),
  });

  return NextResponse.json({ ok: true, decision });
}
