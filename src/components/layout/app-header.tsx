import { Bell, ChevronDown, Search } from "lucide-react";

interface AppHeaderProps {
  userName?: string;
  userEmail?: string;
  searchPlaceholder?: string;
}

export function AppHeader({
  userName,
  userEmail,
  searchPlaceholder = "Ara...",
}: AppHeaderProps) {
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="lum-page-header">
      <div className="lum-search-bar">
        <Search size={17} style={{ color: "var(--color-fg-4)", flexShrink: 0 }} />
        <input readOnly placeholder={searchPlaceholder} />
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "var(--radius-chip)",
            border: "1px solid rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.65)",
            boxShadow: "var(--inset-top-edge)",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--color-fg-3)",
            flexShrink: 0,
          }}
        >
          ⌘ K
        </span>
      </div>

      <div className="lum-user-bar">
        <button
          style={{
            position: "relative",
            display: "grid",
            placeItems: "center",
            width: 36,
            height: 36,
            borderRadius: "var(--radius-control)",
            border: 0,
            background: "rgba(255,255,255,0.55)",
            color: "var(--color-fg-2)",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Bildirimler"
        >
          <Bell size={17} />
          <span
            style={{
              position: "absolute",
              right: 7,
              top: 7,
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "var(--color-accent-lilac)",
              border: "2px solid #fff",
            }}
          />
        </button>

        <span className="lum-user-bar__divider" />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="lum-avatar"
            style={{ width: 36, height: 36, fontSize: 12 }}
          >
            {initials}
          </span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--color-fg-1)" }}>
              {userName ?? "Kullanıcı"}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--color-fg-3)" }}>
              {userEmail ?? ""}
            </p>
          </div>
          <ChevronDown size={13} style={{ color: "var(--color-fg-4)" }} />
        </div>
      </div>
    </header>
  );
}
