import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLogs, projects, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Audit Log</h1>
            <p className="text-sm text-gray-500 mt-0.5">Son 200 sistem aksiyonu</p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
          >
            ← Admin Paneli
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Henüz kayıt yok
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => (
                <div key={log.id} className="px-5 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                        {log.projectTitle && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {log.projectTitle}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                        {log.userEmail && (
                          <span>{log.userName ?? log.userEmail}</span>
                        )}
                        {log.ip && <span>IP: {log.ip}</span>}
                        {log.meta && (
                          <details className="inline">
                            <summary className="cursor-pointer hover:text-gray-600">
                              meta ▸
                            </summary>
                            <pre className="mt-1 text-[10px] bg-gray-50 border border-gray-200 rounded p-2 max-w-md overflow-auto">
                              {JSON.stringify(log.meta, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 shrink-0 pt-0.5">
                      {new Date(log.createdAt).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
