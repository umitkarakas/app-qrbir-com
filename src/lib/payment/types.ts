export type OrderType = "digital_plan" | "studio_service" | "physical_product";

export interface CreateOrderParams {
  userId: string;
  projectId: number;
  orderType: OrderType;
  wcProductId?: string;
  /** Geçerlilik süresi (ms). Varsayılan: 24 saat */
  ttlMs?: number;
}

export interface CheckoutUrl {
  url: string;
  refToken: string;
  pendingOrderId: number;
}

export interface PaymentService {
  /** Pending order kaydı oluşturur ve WooCommerce checkout URL'ini döner */
  createCheckoutUrl(params: CreateOrderParams): Promise<CheckoutUrl>;
}
