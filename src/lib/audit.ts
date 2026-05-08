import { db } from "@/lib/db";
import { auditLogs } from "@/db/schema";

export type AuditAction =
  | "project.activate"
  | "project.status_change"
  | "project.publish"
  | "project.pause"
  | "approval.send"
  | "approval.approve"
  | "approval.revision"
  | "order.completed"
  | "order.expired"
  | "content.save";

interface AuditParams {
  userId?: string | null;
  projectId?: number | null;
  action: AuditAction;
  meta?: Record<string, unknown>;
  ip?: string | null;
}

/**
 * Audit log kaydı oluştur.
 * Hata fırlansa bile ana akışı kesmez — fire-and-forget.
 */
export async function audit(params: AuditParams): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      projectId: params.projectId ?? null,
      action: params.action,
      meta: params.meta ?? null,
      ip: params.ip ?? null,
    });
  } catch (err) {
    // Audit hatası ana işlemi engellemez
    console.error("[audit] log yazılamadı:", err);
  }
}

/**
 * Next.js request headers'ından IP adresini çıkar.
 */
export function getClientIp(headers: Headers): string | null {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    null
  );
}
