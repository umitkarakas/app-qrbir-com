import { db } from "@/lib/db";
import { pendingOrders } from "@/db/schema";
import type { CreateOrderParams, CheckoutUrl, PaymentService } from "./types";

const WC_STORE_URL = (process.env.WC_STORE_URL ?? "https://qrbir.com").replace(/\/$/, "");

/**
 * WooCommerce Adapter — MVP ödeme adaptörü.
 * İleride iyzico veya Stripe adapter eklenirse sadece bu dosya değişir,
 * PaymentService interface kullanan kodlar değişmez.
 */
export class WooCommerceAdapter implements PaymentService {
  async createCheckoutUrl(params: CreateOrderParams): Promise<CheckoutUrl> {
    const {
      userId,
      projectId,
      orderType,
      wcProductId,
      ttlMs = 24 * 60 * 60 * 1000,
    } = params;

    const refToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + ttlMs);

    const [row] = await db
      .insert(pendingOrders)
      .values({
        userId,
        projectId,
        orderType,
        refToken,
        wcProductId: wcProductId ?? null,
        status: "pending",
        expiresAt,
      })
      .returning({ id: pendingOrders.id });

    // WooCommerce ürün sayfasına ?ref=TOKEN ile yönlendirme
    const productPath = wcProductId
      ? `/urun/${wcProductId}`
      : "/sepet";

    const url = `${WC_STORE_URL}${productPath}?ref=${refToken}&project_id=${projectId}`;

    return { url, refToken, pendingOrderId: row.id };
  }
}

// Singleton — adapter'ı değiştirmek için burası güncellenir
export const paymentService: PaymentService = new WooCommerceAdapter();
