import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pendingOrders, woocommerceOrders, projects, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { audit } from "@/lib/audit";
import { trySendMail, sendProjectPublishedEmail } from "@/lib/mailer";

const WC_WEBHOOK_SECRET = process.env.WC_WEBHOOK_SECRET ?? "";

/**
 * HMAC-SHA256 imza doğrulaması.
 * WooCommerce webhook header: X-WC-Webhook-Signature
 * İmza = base64(hmac-sha256(secret, rawBody))
 */
async function verifySignature(
  secret: string,
  rawBody: string,
  signature: string
): Promise<boolean> {
  if (!secret) return false; // Secret yoksa her zaman reddet
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(signed)));
  return expected === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-wc-webhook-signature") ?? "";
  const topic = req.headers.get("x-wc-webhook-topic") ?? "";

  // İmza doğrula
  if (WC_WEBHOOK_SECRET) {
    const valid = await verifySignature(WC_WEBHOOK_SECRET, rawBody, signature);
    if (!valid) {
      console.error("[wc-webhook] Invalid signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Sadece order.completed veya order.updated olaylarını işle
  if (!topic.startsWith("order.")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const wcOrderId = payload.id as number;
  const status = (payload.status as string) ?? "";
  const metaData = (payload.meta_data as Array<{ key: string; value: string }>) ?? [];

  // ref_token sipariş meta'sından okunur (WooCommerce'de checkout URL param olarak taşınır)
  const refToken = metaData.find((m) => m.key === "ref_token")?.value
    ?? (payload.ref_token as string | undefined);

  // woocommerce_orders tablosuna idempotent yaz
  const existingWcOrder = await db
    .select({ id: woocommerceOrders.id })
    .from(woocommerceOrders)
    .where(eq(woocommerceOrders.woocommerceOrderId, wcOrderId))
    .limit(1);

  if (status === "completed" || status === "processing") {
    if (refToken) {
      // Pending order bul
      const [pending] = await db
        .select()
        .from(pendingOrders)
        .where(eq(pendingOrders.refToken, refToken))
        .limit(1);

      if (pending && pending.status === "pending") {
        // Süresi dolmuş mu?
        if (pending.expiresAt && new Date() > pending.expiresAt) {
          await db
            .update(pendingOrders)
            .set({ status: "expired", updatedAt: new Date() })
            .where(eq(pendingOrders.id, pending.id));
        } else {
          // Projeyi aktive et
          await db
            .update(projects)
            .set({ status: "published", updatedAt: new Date() })
            .where(eq(projects.id, pending.projectId));

          // Pending order'ı tamamla
          await db
            .update(pendingOrders)
            .set({ status: "completed", updatedAt: new Date() })
            .where(eq(pendingOrders.id, pending.id));

          // WooCommerce order kaydını oluştur/güncelle
          if (existingWcOrder.length === 0) {
            await db.insert(woocommerceOrders).values({
              woocommerceOrderId: wcOrderId,
              userId: pending.userId,
              projectId: pending.projectId,
              pendingOrderId: pending.id,
              orderType: pending.orderType,
              paymentStatus: "completed",
              total: String((payload.total as string) ?? "0"),
              currency: (payload.currency as string) ?? "TRY",
              rawPayloadJson: payload,
            });
          }

          await audit({
            userId: pending.userId,
            projectId: pending.projectId,
            action: "order.completed",
            meta: { wcOrderId, refToken, orderType: pending.orderType },
          });

          // Müşteriye "projeniz yayına alındı" e-postası gönder
          const [publishedProject] = await db
            .select({
              title: projects.title,
              slug: projects.slug,
              subdomainType: projects.subdomainType,
            })
            .from(projects)
            .where(eq(projects.id, pending.projectId))
            .limit(1);

          const [customer] = await db
            .select({ name: users.name, email: users.email })
            .from(users)
            .where(eq(users.id, pending.userId))
            .limit(1);

          if (customer?.email && publishedProject) {
            const appUrl = process.env.BETTER_AUTH_URL ?? "https://app.qrbir.com";
            const publicUrl = `https://${publishedProject.subdomainType}.qrbir.com/${publishedProject.slug}`;
            trySendMail(
              () =>
                sendProjectPublishedEmail({
                  to: customer.email,
                  projectTitle: publishedProject.title,
                  publicUrl,
                  qrDownloadUrl: `${appUrl}/dashboard`,
                }),
              "project-published-wc"
            );
          }
        }
      }
    }

    // ref_token yoksa sadece kaydet, proje aktivasyonu yapma
    if (!refToken && existingWcOrder.length === 0) {
      await db.insert(woocommerceOrders).values({
        woocommerceOrderId: wcOrderId,
        paymentStatus: status === "completed" ? "completed" : "pending",
        total: String((payload.total as string) ?? "0"),
        currency: (payload.currency as string) ?? "TRY",
        rawPayloadJson: payload,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
