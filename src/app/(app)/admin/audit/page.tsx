import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLogs, projects, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { ChevronLeft } from "lucide-react";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const ACTION_LABELS: Record<string, string> = {
  "project.activate": "✅ Proje aktive",
  "project.status_change": "🔄 Durum değişikliği",
  "project.publish": "🚀 Yayınlandı",
  "project.pause": "⏸ Duraklatıldı",
  "approval.send": "📤 Onay linki gönderildi",
  "approval.approve": "👍 Müşteri onayladı",
  "approval.revision": "🔄 Müşteri revizyon istedi",
  "order.completed": "💳 Ödeme tamamlandı",
  "order.expired": "⌛ Sipariş süresi doldu",
  "content.save": "💾 İçerik kaydedildi",
};

export default async function AuditPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) redirect("/dashboard");

  const logs = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      meta: auditLogs.meta,
      ip: auditLogs.ip,
      createdAt: auditLogs.createdAt,
      projectId: auditLogs.projectId,
      projectTitle: projects.title,
      userName: users.name,
      userEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(projects, eq(auditLogs.projectId, projects.id))
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(200);

  return (
    <>
      <AppHeader searchPlaceholder="Audit log'da ara..." />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 className="lum-section-title">Audit Log</h1>
          <p className="lum-section-sub">Son 200 sistem aksiyonu</p>
        </div>
        <Link
          href="/admin"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--color-fg-3)", textDecoration: "none" }}
        >
          <ChevronLeft size={15} />
          Admin Paneli
        </Link>
      </div>

      <div className="lum-glass" style={{ padding: 0, overflow: "hidden" }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", fontSize: 13, color: "var(--color-fg-4)" }}>
            Henüz kayıt yok
          </div>
        ) : (
          <div>
            {logs.map((log, i) => (
              <div key={log.id} className="lum-project-row" style={{ padding: "12px 20px", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg-1)" }}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                      {log.projectTitle && (
                        <span style={{ fontSize: 11, background: "rgba(255,255,255,0.5)", color: "var(--color-fg-3)", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.6)" }}>
                          {log.projectTitle}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, fontSize: 11, color: "var(--color-fg-4)", flexWrap: "wrap" }}>
                      {log.userEmail && <span>{log.userName ?? log.userEmail}</span>}
                      {log.ip && <span>IP: {log.ip}</span>}
                      {log.meta != null && (
                        <details style={{ display: "inline" }}>
                          <summary style={{ cursor: "pointer" }}>meta ▸</summary>
                          <pre style={{ marginTop: 4, fontSize: 10, background: "rgba(0,0,0,0.06)", borderRadius: 6, padding: 8, maxWidth: 400, overflow: "auto", border: "1px solid rgba(0,0,0,0.08)" }}>
                            {JSON.stringify(log.meta as Record<string, unknown>, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-fg-4)", flexShrink: 0, paddingTop: 2 }}>
                    {new Date(log.createdAt).toLocaleString("tr-TR", {
                      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
