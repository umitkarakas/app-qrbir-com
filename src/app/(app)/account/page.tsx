import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AccountForm } from "./account-form";
import { LogoutButton } from "@/components/logout-button";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hesabım</h1>
            <p className="text-gray-500 text-sm mt-1">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <LogoutButton className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2" />
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              ← Panele Dön
            </Link>
          </div>
        </div>

        <AccountForm
          initialName={session.user.name ?? ""}
          initialEmail={session.user.email ?? ""}
        />
      </div>
    </div>
  );
}
