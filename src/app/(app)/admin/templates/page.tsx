import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates } from "@/db/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { TemplateActions } from "./template-actions";
import { getTemplateContractFromMetadata } from "@/features/block-editor/lib/template-contract";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  restaurant_menu: "Restoran Menü",
  bio_link: "Bio Link",
  brand_bio: "Marka Bio",
  google_review: "Google Yorum",
  event_invitation: "Etkinlik",
  campaign_link: "Kampanya",
};

export default async function AdminTemplatesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) redirect("/dashboard");

  const list = await db.select().from(templates).orderBy(desc(templates.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader userName={session.user.name} userEmail={session.user.email} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Şablonlar</h1>
            <p className="text-sm text-gray-500 mt-1">
              {list.length} reusable blok kompozisyonu
            </p>
          </div>
          <Link
            href="/admin/templates/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            + Yeni Şablon
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-500">
            <p className="text-lg font-medium mb-2">Henüz şablon yok</p>
            <p className="text-sm">
              Bir sonraki adımda QR1 TemplateEditor buraya bağlanacak.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Şablon</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contract</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((template) => {
                  const contract = getTemplateContractFromMetadata(template.metadata);
                  const editableCount = contract?.userEditable.blocks.length ?? 0;
                  return (
                    <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/templates/${template.id}/edit`}
                            className="font-medium text-gray-900 hover:text-violet-700"
                          >
                            {template.name}
                          </Link>
                          <Link
                            href={`/admin/templates/${template.id}/edit`}
                            className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            Düzenle
                          </Link>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{template.slug}</div>
                        {template.description ? (
                          <div className="text-xs text-gray-400 mt-1 max-w-xl">
                            {template.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {PRODUCT_TYPE_LABELS[template.productType] ?? template.productType}
                      </td>
                      <td className="px-4 py-3">
                        {contract ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ {editableCount} alan
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <TemplateActions
                          id={template.id}
                          isActive={template.isActive}
                          isPremium={template.isPremium}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
