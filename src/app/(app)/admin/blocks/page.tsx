import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blockTypes } from "@/db/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { AppHeader } from "@/components/layout/app-header";
import { BlockTypeActions } from "./block-type-actions";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const CATEGORY_LABELS: Record<string, string> = {
  common: "Temel",
  menu: "Restoran",
  invitation: "Etkinlik",
  bio_link: "Bio Link",
};

export default async function AdminBlocksPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) redirect("/dashboard");

  const list = await db
    .select()
    .from(blockTypes)
    .orderBy(asc(blockTypes.sortOrder), asc(blockTypes.name));

  const enabledCount = list.filter((block) => block.isEnabled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader userName={session.user.name} userEmail={session.user.email} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bloklar</h1>
            <p className="text-sm text-gray-500 mt-1">
              {list.length} blok tipi, {enabledCount} aktif
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-500">
            <p className="text-lg font-medium mb-2">Blok registry boş</p>
            <p className="text-sm">Migration/seed çalışınca QR1 blokları burada görünecek.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Blok</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Site Tipleri</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((block) => (
                  <tr key={block.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{block.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{block.blockType}</div>
                      {block.description ? (
                        <div className="text-xs text-gray-400 mt-1 max-w-xl">{block.description}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {CATEGORY_LABELS[block.category] ?? block.category}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <div className="flex flex-wrap gap-1.5">
                        {block.allowedSiteTypes.map((siteType) => (
                          <span
                            key={siteType}
                            className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {siteType}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <BlockTypeActions
                        id={block.id}
                        name={block.name}
                        description={block.description}
                        icon={block.icon}
                        category={block.category}
                        allowedSiteTypes={block.allowedSiteTypes}
                        isEnabled={block.isEnabled}
                        isPro={block.isPro}
                        sortOrder={block.sortOrder}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
