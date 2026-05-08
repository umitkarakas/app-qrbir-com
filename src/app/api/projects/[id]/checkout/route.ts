import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, pendingOrders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { paymentService } from "@/lib/payment/woocommerce-adapter";
import type { OrderType } from "@/lib/payment/types";

const Body = z.object({
  orderType: z.enum(["digital_plan", "studio_service", "physical_product"]),
  wcProductId: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (Number.isNaN(projectId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  // Projenin sahibi mi?
  const [project] = await db
    .select({ id: projects.id, userId: projects.userId, status: projects.status })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.userId, session.user.id)
      )
    )
    .limit(1);

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Zaten yayındaysa gerek yok
  if (project.status === "published") {
    return NextResponse.json({ error: "Proje zaten yayında" }, { status: 409 });
  }

  // Beklemede varsa eski token'ı iptal et, yenisini oluştur
  await db
    .update(pendingOrders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(pendingOrders.projectId, projectId),
        eq(pendingOrders.status, "pending")
      )
    );

  const { url, refToken, pendingOrderId } = await paymentService.createCheckoutUrl({
    userId: session.user.id,
    projectId,
    orderType: body.data.orderType as OrderType,
    wcProductId: body.data.wcProductId,
  });

  return NextResponse.json({ ok: true, url, refToken, pendingOrderId });
}
