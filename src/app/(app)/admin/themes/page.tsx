import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { AppHeader } from "@/components/layout/app-header";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  restaurant_menu: "Restoran Menü",
  bio_link: "Bio Link",
  brand_bio: "Marka Bio",
  google_review: "Google Yorum",
  event_invitation: "Etkinlik",
  campaign_link: "Kampanya",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  active: "Aktif",
  archived: "Arşiv",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-500",
};

export default async function AdminThemesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) redirect("/dashboard");

  const list = await db.select().from(themes).orderBy(desc(themes.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader userName={session.user.name} userEmail={session.user.email} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Temalar</h1>
            <p className="text-sm text-gray-500 mt-1">{list.length} tema kayıtlı</p>
          </div>
          <Link
            href="/admin/themes/new"
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            + Yeni Tema
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium mb-2">Henüz tema yok</p>
            <p className="text-sm">İlk temayı oluşturmak için Yeni Tema butonuna tıklayın.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((theme) => (
                  <tr key={theme.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{theme.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {PRODUCT_TYPE_LABELS[theme.productType] ?? theme.productType}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {theme.isPremium ? "Premium" : theme.isFree ? "Ücretsiz" : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[theme.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABELS[theme.status] ?? theme.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/themes/${theme.id}/edit`}
                        className="text-violet-600 hover:text-violet-800 font-medium mr-4"
                      >
                        Düzenle
                      </Link>
                      <Link
                        href={`/admin/themes/${theme.id}/preview`}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Önizle
                      </Link>
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
