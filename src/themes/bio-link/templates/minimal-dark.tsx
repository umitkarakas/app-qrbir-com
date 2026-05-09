import type React from "react";
import type { ThemeTemplate } from "@/lib/theme-editor/contract";
import type { BioLinkV1Type } from "@/schemas/bio_link/v1";
import type { ThemeConfig } from "@/types/theme";
import { FONT_MAP, RADIUS_MAP } from "@/types/theme";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  twitter: "Twitter / X",
  youtube: "YouTube",
  tiktok: "TikTok",
};

const SOCIAL_ICONS: Record<string, string> = {
  instagram: "📸",
  twitter: "🐦",
  youtube: "▶️",
  tiktok: "🎵",
};

function Render({
  content,
  theme,
}: {
  content: BioLinkV1Type;
  theme: ThemeConfig;
}) {
  const colors = theme.colors;
  const font = FONT_MAP[theme.font ?? "sans"];
  const radius = RADIUS_MAP[theme.radius ?? "lg"];

  const socialEntries = (["instagram", "twitter", "youtube", "tiktok"] as const).filter(
    (k) => content.social[k],
  );

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.fg,
        fontFamily: font,
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 20px 32px",
        maxWidth: 430,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Avatar */}
      {content.profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.profile.avatarUrl}
          alt=""
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            objectFit: "cover",
            border: `3px solid ${colors.accent}`,
            marginBottom: 16,
          }}
        />
      ) : (
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            backgroundColor: colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "#fff",
            marginBottom: 16,
          }}
        >
          {content.profile.name.charAt(0).toUpperCase() || "?"}
        </div>
      )}

      {/* Name & Bio */}
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", textAlign: "center" }}>
        {content.profile.name || "İsim"}
      </h1>
      {content.profile.bio && (
        <p
          style={{
            fontSize: 14,
            color: colors.muted ?? colors.fg,
            textAlign: "center",
            margin: "0 0 28px",
            lineHeight: 1.5,
            opacity: 0.75,
          }}
        >
          {content.profile.bio}
        </p>
      )}

      {/* Links */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        {content.links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "14px 20px",
              backgroundColor: colors.card ?? colors.accent,
              color: colors.cardFg ?? "#fff",
              borderRadius: radius,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
              border: `1px solid ${colors.border ?? "transparent"}`,
              transition: "opacity 0.15s",
            }}
          >
            {link.icon && <span style={{ fontSize: 18 }}>{link.icon}</span>}
            {link.label}
          </a>
        ))}
      </div>

      {/* Social icons */}
      {socialEntries.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 32,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {socialEntries.map((k) => (
            <a
              key={k}
              href={`https://${k}.com/${content.social[k]}`}
              title={SOCIAL_LABELS[k]}
              style={{
                fontSize: 24,
                textDecoration: "none",
                opacity: 0.8,
              }}
            >
              {SOCIAL_ICONS[k]}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export const minimalDark: ThemeTemplate<BioLinkV1Type> = {
  id: "bio-link/minimal-dark",
  name: "Minimal Dark",
  productType: "bio_link",
  version: 1,
  viewport: {
    baseWidth: 390,
    minWidth: 320,
    maxWidth: 430,
    safeArea: "mobile",
  },
  capabilities: ["avatarImage", "linkButtons", "socialIcons", "darkMode"],
  defaultConfig: {
    colors: {
      bg: "#0f0f0f",
      fg: "#f5f5f5",
      accent: "#7c6dff",
      card: "#1e1e2e",
      cardFg: "#f5f5f5",
      border: "#2e2e3e",
      muted: "#a0a0b0",
    },
    font: "sans",
    radius: "lg",
  },
  editorSchema: {
    sections: [
      {
        label: "Renkler",
        fields: [
          { type: "color", key: "colors.bg", label: "Arka Plan" },
          { type: "color", key: "colors.fg", label: "Metin" },
          { type: "color", key: "colors.accent", label: "Vurgu" },
          { type: "color", key: "colors.card", label: "Buton Arka Planı" },
          { type: "color", key: "colors.cardFg", label: "Buton Metni" },
          { type: "color", key: "colors.muted", label: "İkincil Metin" },
        ],
      },
      {
        label: "Tipografi",
        fields: [
          { type: "font", key: "font", label: "Font" },
          { type: "radius", key: "radius", label: "Köşe Yuvarlama" },
        ],
      },
    ],
  },
  render: ({ content, theme }) => <Render content={content} theme={theme} />,
};
