"use client";

import type { BrandBioV1Type } from "@/schemas/brand_bio/v1";
import type { ThemeConfig } from "@/types/theme";
import { bgStyle, FONT_MAP, RADIUS_MAP } from "@/types/theme";

const SOCIAL_ICONS: Record<string, string> = {
  instagram: "📷",
  twitter: "🐦",
  youtube: "▶️",
  linkedin: "💼",
  tiktok: "🎵",
};

const SOCIAL_URLS: Record<string, string> = {
  instagram: "https://instagram.com/",
  twitter: "https://twitter.com/",
  youtube: "https://youtube.com/@",
  linkedin: "https://linkedin.com/in/",
  tiktok: "https://tiktok.com/@",
};

export function BrandBioRenderer({
  content,
  theme,
}: {
  content: BrandBioV1Type;
  theme: ThemeConfig;
}) {
  const { brand, contact, social, links } = content;
  const fontFamily = FONT_MAP[theme.font ?? "sans"] ?? FONT_MAP.sans;
  const radius = RADIUS_MAP[theme.radius ?? "md"] ?? RADIUS_MAP.md;

  const socialEntries = (
    ["instagram", "twitter", "youtube", "linkedin", "tiktok"] as const
  ).filter((k) => !!social[k]);

  return (
    <div
      style={{
        minHeight: "100%",
        ...bgStyle(theme.colors.bg),
        color: theme.colors.fg,
        fontFamily,
        paddingBottom: 32,
      }}
    >
      {/* Kapak Görseli */}
      {brand.coverUrl && (
        <div
          style={{
            width: "100%",
            height: 160,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.coverUrl}
            alt="Kapak"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Logo + Başlık Alanı */}
      <div
        style={{
          padding: brand.coverUrl ? "0 20px 16px" : "24px 20px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginTop: brand.coverUrl ? -40 : 0,
        }}
      >
        {brand.logoUrl && (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: `3px solid ${theme.colors.bg}`,
              overflow: "hidden",
              background: "#fff",
              marginBottom: 12,
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoUrl}
              alt={brand.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        {brand.name && (
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: theme.colors.fg,
              marginBottom: 4,
            }}
          >
            {brand.name}
          </h1>
        )}
        {brand.tagline && (
          <p
            style={{
              fontSize: 13,
              color: theme.colors.fg,
              opacity: 0.65,
              marginBottom: 8,
            }}
          >
            {brand.tagline}
          </p>
        )}
        {brand.description && (
          <p
            style={{
              fontSize: 13,
              color: theme.colors.fg,
              opacity: 0.8,
              lineHeight: 1.6,
              maxWidth: 320,
            }}
          >
            {brand.description}
          </p>
        )}
      </div>

      {/* Sosyal Medya */}
      {socialEntries.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            padding: "0 20px 20px",
            flexWrap: "wrap",
          }}
        >
          {socialEntries.map((key) => (
            <a
              key={key}
              href={`${SOCIAL_URLS[key]}${social[key]!.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: `${theme.colors.fg}15`,
                color: theme.colors.fg,
                borderRadius: radius,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <span>{SOCIAL_ICONS[key]}</span>
              <span>{social[key]}</span>
            </a>
          ))}
        </div>
      )}

      {/* Linkler */}
      {links.length > 0 && (
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                background: theme.colors.accent,
                color: "#fff",
                borderRadius: radius,
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              {link.label || link.url}
            </a>
          ))}
        </div>
      )}

      {/* İletişim */}
      {(contact.phone || contact.email || contact.address) && (
        <div
          style={{
            margin: "20px 20px 0",
            background: `${theme.colors.fg}08`,
            borderRadius: radius,
            padding: "16px",
            fontSize: 13,
            lineHeight: 2,
            color: theme.colors.fg,
            opacity: 0.85,
          }}
        >
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              📞 {contact.phone}
            </a>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              ✉️ {contact.email}
            </a>
          )}
          {contact.address && (
            <div>📍 {contact.address}</div>
          )}
        </div>
      )}

      {/* Web Sitesi */}
      {brand.website && (
        <div style={{ padding: "16px 20px 0", textAlign: "center" }}>
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              color: theme.colors.accent,
              textDecoration: "underline",
            }}
          >
            🌐 {brand.website.replace(/^https?:\/\//, "")}
          </a>
        </div>
      )}
    </div>
  );
}
