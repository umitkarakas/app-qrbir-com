"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  User,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new", label: "Yeni Proje", icon: PlusCircle },
  { href: "/account", label: "Hesabım", icon: User },
];

interface AppSidebarProps {
  isAdmin?: boolean;
  userName?: string;
  userEmail?: string;
}

export function AppSidebar({ isAdmin, userName, userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <aside
      className="lum-glass"
      style={{
        width: 272,
        flexShrink: 0,
        minHeight: "calc(100vh - 48px)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 8px 0" }}>
        <div className="lum-logomark" style={{ width: 44, height: 44 }}>
          <div className="lum-logomark__diamond" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 600, color: "var(--color-fg-1)", letterSpacing: 0 }}>
          QRbir
        </span>
      </div>

      {/* Nav */}
      <nav style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 6 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 48,
                padding: "0 16px",
                borderRadius: "var(--radius-control)",
                color: active ? "var(--color-fg-1)" : "var(--color-fg-2)",
                fontWeight: 500,
                fontSize: 14,
                textDecoration: "none",
                background: active ? "var(--gradient-active-nav)" : "transparent",
                boxShadow: active ? "var(--shadow-nav-active)" : "none",
                transition: "all var(--duration-base) var(--easing-base)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.45)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.transform = "none";
                }
              }}
            >
              <Icon
                size={20}
                style={{ color: active ? "var(--color-accent-violet-deep)" : "var(--color-fg-3)", flexShrink: 0 }}
              />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: 48,
              padding: "0 16px",
              borderRadius: "var(--radius-control)",
              color: pathname.startsWith("/admin") ? "var(--color-fg-1)" : "var(--color-fg-2)",
              fontWeight: 500,
              fontSize: 14,
              textDecoration: "none",
              background: pathname.startsWith("/admin") ? "var(--gradient-active-nav)" : "transparent",
              boxShadow: pathname.startsWith("/admin") ? "var(--shadow-nav-active)" : "none",
              transition: "all var(--duration-base) var(--easing-base)",
            }}
          >
            <ShieldCheck
              size={20}
              style={{
                color: pathname.startsWith("/admin") ? "var(--color-accent-violet-deep)" : "var(--color-fg-3)",
                flexShrink: 0,
              }}
            />
            Admin
          </Link>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Upsell / user section */}
      <div
        style={{
          padding: 20,
          borderRadius: 26,
          border: "1px solid rgba(255,255,255,0.6)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.58), rgba(245,243,255,0.55), rgba(239,246,255,0.45))",
          boxShadow: "0 22px 48px rgba(124,109,255,0.14)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className="lum-avatar"
            style={{ width: 40, height: 40, fontSize: 13 }}
          >
            {initials}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-fg-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName ?? "Kullanıcı"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-fg-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail ?? ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            height: 40,
            padding: "0 14px",
            borderRadius: "var(--radius-control)",
            border: "1px solid rgba(255,255,255,0.65)",
            background: "rgba(255,255,255,0.55)",
            color: "var(--color-fg-2)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all var(--duration-base)",
          }}
        >
          <LogOut size={15} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
