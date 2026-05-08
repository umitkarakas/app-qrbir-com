import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, pendingOrders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { audit, getClientIp } from "@/lib/audit";

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
    .select({ id: projects.id, status: projects.status })
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

  return NextResponse.json({ ok: true });
}
