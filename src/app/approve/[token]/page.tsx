import { db } from "@/lib/db";
import { approvalRequests, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ApproveActions } from "./approve-actions";

export default async function ApprovePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [approval] = await db
    .select({
      id: approvalRequests.id,
      status: approvalRequests.status,
      versionNumber: approvalRequests.versionNumber,
      adminNote: approvalRequests.adminNote,
      expiresAt: approvalRequests.expiresAt,
      projectId: approvalRequests.projectId,
    })
    .from(approvalRequests)
    .where(eq(approvalRequests.token, token))
    .limit(1);

  if (!approval) notFound();

  const [project] = await db
    .select({
      title: projects.title,
      slug: projects.slug,
      subdomainType: projects.subdomainType,
    })
    .from(projects)
    .where(eq(projects.id, approval.projectId))
    .limit(1);

  const pubUrl = project
    ? `https://${project.subdomainType}.qrbir.com/${project.slug}`
    : null;

  const isExpired =
    approval.expiresAt && new Date() > new Date(approval.expiresAt);
  const isUsed = approval.status !== "pending";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <a
            href="https://qrbir.com"
            className="inline-flex items-center gap-2 text-xl font-bold text-gray-900"
          >
            ⚡ QRbir
          </a>
        </div>

        {/* Kart */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Başlık */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h1 className="text-lg font-semibold text-gray-900">
              {project?.title ?? "Projeniz hazır"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              v{approval.versionNumber} · Onay bekleniyor
            </p>
          </div>

          {/* İçerik */}
          <div className="px-6 py-5 space-y-5">
            {/* Süresi dolmuş */}
            {isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                Bu onay linkinin süresi dolmuştur. Lütfen ekibimizle iletişime geçin.
              </div>
            )}

            {/* Daha önce yanıtlanmış */}
            {!isExpired && isUsed && (
              <div
                className={`rounded-xl px-4 py-3 text-sm border ${
                  approval.status === "approved"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-orange-50 border-orange-200 text-orange-700"
                }`}
              >
                {approval.status === "approved"
                  ? "✅ Bu projeyi daha önce onayladınız."
                  : "🔄 Bu proje için daha önce revizyon talebinde bulundunuz. Ekibimiz düzenleme yapıyor."}
              </div>
            )}

            {/* Admin notu */}
            {approval.adminNote && (
              <div className="bg-gray-50 border-l-4 border-gray-300 rounded-r-xl px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Ekibimizin notu
                </p>
                <p className="text-sm text-gray-700">{approval.adminNote}</p>
              </div>
            )}

            {/* Önizleme linki */}
            {pubUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Önizleme
                </p>
                <a
                  href={pubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-mono bg-blue-50 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors"
                >
                  <span className="flex-1 truncate">{pubUrl}</span>
                  <span className="shrink-0">↗</span>
                </a>
                <p className="text-xs text-gray-400">
                  Bağlantıya tıklayarak tasarımınızı inceleyebilirsiniz.
                </p>
              </div>
            )}

            {/* Eylem butonları — sadece pending ise */}
            {!isExpired && !isUsed && (
              <ApproveActions token={token} />
            )}

            {/* Süre bilgisi */}
            {!isExpired && !isUsed && approval.expiresAt && (
              <p className="text-xs text-center text-gray-400">
                Bu link{" "}
                {new Date(approval.expiresAt).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                tarihine kadar geçerlidir.
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Sorularınız için{" "}
          <a
            href="mailto:destek@qrbir.com"
            className="underline hover:text-gray-600"
          >
            destek@qrbir.com
          </a>
        </p>
      </div>
    </div>
  );
}
