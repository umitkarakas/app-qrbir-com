"use client";

import type { BioLinkV1Type } from "@/schemas/bio_link/v1";
import type { ThemeConfig } from "@/types/theme";
import { FONT_MAP, RADIUS_MAP, bgStyle } from "@/types/theme";

const SOCIAL_ICONS: Record<string, string> = {
  instagram: "📸",
  twitter: "🐦",
  youtube: "▶️",
  tiktok: "🎵",
};

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  twitter: "Twitter / X",
  youtube: "YouTube",
  tiktok: "TikTok",
};

export function BioLinkRenderer({
  content,
  theme,
}: {
  content: BioLinkV1Type;
  theme: ThemeConfig;
}) {
  const colors = theme.colors;
  const font = FONT_MAP[theme.font ?? "sans"];
  const radius = RADIUS_MAP[theme.radius ?? "md"];

  const socialEntries = (
    ["instagram", "twitter", "youtube", "tiktok"] as const
  ).filter((k) => content.social[k]);

  return (
    <div
      style={{
        ...bgStyle(colors.bg),
        color: colors.fg,
        fontFamily: font,
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 20px 24px",
      }}
    >
      {/* Avatar */}
      {content.profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.profile.avatarUrl}
          alt=""
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            objectFit: "cover",
            border: `3px solid ${colors.accent}`,
            marginBottom: 14,
          }}
        />
      ) : (
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            marginBottom: 14,
          }}
        >
          👤
        </div>
      )}

      {/* İsim */}
      <div
        style={{
          fontWeight: 700,
          fontSize: 20,
          color: colors.fg,
          textAlign: "center",
          marginBottom: content.profile.bio ? 6 : 20,
        }}
      >
        {content.profile.name || "İsim"}
      </div>

      {/* Bio */}
      {content.profile.bio && (
        <div
          style={{
            fontSize: 13,
            color: colors.muted ?? colors.fg,
            textAlign: "center",
            lineHeight: 1.5,
            marginBottom: 20,
            opacity: 0.8,
            maxWidth: 220,
          }}
        >
          {content.profile.bio}
        </div>
      )}

      {/* Linkler */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        {content.links.length === 0 && (
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: colors.muted ?? "#9ca3af",
              padding: "16px 0",
            }}
          >
            Henüz link eklenmedi
          </div>
        )}
        {content.links.map((link) => (
          <div
            key={link.id}
            style={{
              background: colors.card ?? "rgba(255,255,255,0.15)",
              border: `1px solid ${colors.border ?? "rgba(0,0,0,0.08)"}`,
              borderRadius: radius,
              padding: "12px 16px",
              textAlign: "center",
              fontWeight: 600,
              fontSize: 14,
              color: colors.cardFg ?? colors.fg,
              cursor: "pointer",
            }}
          >
            {link.label || "Link Adı"}
          </div>
        ))}
      </div>

      {/* Sosyal */}
      {socialEntries.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 24,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {socialEntries.map((key) => (
            <div
              key={key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: colors.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {SOCIAL_ICONS[key]}
              </div>
              <div style={{ fontSize: 10, color: colors.muted ?? colors.fg, opacity: 0.7 }}>
                {SOCIAL_LABELS[key]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
