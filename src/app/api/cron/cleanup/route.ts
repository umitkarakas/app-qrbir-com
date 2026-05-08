import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pendingOrders } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

/**
 * Süresi dolmuş pending_orders kayıtlarını temizler.
 * Çağırım: GET /api/cron/cleanup?secret=CRON_SECRET
 * Sunucuda cron: curl -sf "http://127.0.0.1:3007/api/cron/cleanup?secret=..." | logger -t qrbir-cron
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // pending_orders: expires_at geçmiş ve hala pending olanları expired yap
  const result = await db
    .update(pendingOrders)
    .set({ status: "expired", updatedAt: now })
    .where(
      and(
        eq(pendingOrders.status, "pending"),
        lt(pendingOrders.expiresAt, now)
      )
    )
    .returning({ id: pendingOrders.id });

  console.log(`[cron/cleanup] Expired ${result.length} pending_orders`);

  return NextResponse.json({
    ok: true,
    expired: result.length,
    at: now.toISOString(),
  });
}
