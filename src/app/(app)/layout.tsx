import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const isAdmin = (session.user as { role?: string }).role === "admin";

  return (
    <div className="lum-app-layout">
      {/* Fixed decorative background */}
      <div className="lum-bgdecor" aria-hidden="true">
        <div className="lum-orb lum-orb--violet" />
        <div className="lum-orb lum-orb--sky" />
        <div className="lum-orb lum-orb--peach" />
        <div className="lum-streak" />
      </div>

      {/* Sticky sidebar */}
      <div className="lum-sidebar-wrap">
        <AppSidebar
          isAdmin={isAdmin}
          userName={session.user.name ?? undefined}
          userEmail={session.user.email ?? undefined}
        />
      </div>

      {/* Scrollable main */}
      <div className="lum-main-wrap">
        {children}
      </div>
    </div>
  );
}
