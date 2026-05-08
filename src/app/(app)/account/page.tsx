import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountForm } from "./account-form";
import { AppHeader } from "@/components/layout/app-header";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <>
      <AppHeader
        userName={session.user.name ?? undefined}
        userEmail={session.user.email ?? undefined}
        searchPlaceholder="Ayarlarda ara..."
      />

      <div style={{ maxWidth: 560 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="lum-section-title">Hesabım</h1>
          <p className="lum-section-sub">Profil ve şifre ayarları</p>
        </div>

        <AccountForm
          initialName={session.user.name ?? ""}
          initialEmail={session.user.email ?? ""}
        />
      </div>
    </>
  );
}
