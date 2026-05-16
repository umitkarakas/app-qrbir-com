import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { AppHeader } from "@/components/layout/app-header";
import { ThemesGrid } from "./themes-grid";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export default async function AdminThemesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (!ADMIN_EMAILS.includes(session.user.email ?? "")) redirect("/dashboard");

  const list = await db.select().from(themes).orderBy(desc(themes.id));
  const themeCards = list.map((theme) => ({
    id: theme.id,
    name: theme.name,
    slug: theme.slug,
    description: theme.description,
    productType: theme.productType,
    previewImageUrl: theme.previewImageUrl,
    isFree: theme.isFree,
    isPremium: theme.isPremium,
    status: theme.status,
    themeConfigJson: theme.themeConfigJson,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader userName={session.user.name} userEmail={session.user.email} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasarımlar</h1>
            <p className="text-sm text-gray-500 mt-1">{themeCards.length} tasarım kayıtlı</p>
          </div>
          <Link
            href="/admin/themes/new"
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            + Yeni Tasarım
          </Link>
        </div>

        <ThemesGrid themes={themeCards} />
      </main>
    </div>
  );
}
