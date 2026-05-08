"use client";

import type { EventInvitationV1Type } from "@/schemas/event_invitation/v1";
import type { ThemeConfig } from "@/types/theme";
import { bgStyle, FONT_MAP, RADIUS_MAP } from "@/types/theme";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  return timeStr; // "19:00" zaten uygun format
}

export function EventInvitationRenderer({
  content,
  theme,
}: {
  content: EventInvitationV1Type;
  theme: ThemeConfig;
}) {
  const { event, organizer, rsvp } = content;
  const fontFamily = FONT_MAP[theme.font ?? "sans"] ?? FONT_MAP.sans;
  const radius = RADIUS_MAP[theme.radius ?? "md"] ?? RADIUS_MAP.md;

  const hasOrganizer = organizer.name || organizer.phone || organizer.email;

  return (
    <div
      style={{
        minHeight: "100%",
        ...bgStyle(theme.colors.bg),
        color: theme.colors.fg,
        fontFamily,
        paddingBottom: 40,
      }}
    >
      {/* Kapak */}
      {event.coverUrl && (
        <div style={{ width: "100%", height: 200, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.coverUrl}
            alt={event.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Başlık Alanı */}
      <div
        style={{
          padding: "28px 24px 20px",
          textAlign: "center",
        }}
      >
        {event.title && (
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: theme.colors.fg,
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </h1>
        )}
        {event.subtitle && (
          <p
            style={{
              fontSize: 14,
              color: theme.colors.fg,
              opacity: 0.65,
              lineHeight: 1.6,
            }}
          >
            {event.subtitle}
          </p>
        )}
      </div>

      {/* Tarih & Saat Kartı */}
      {(event.date || event.time) && (
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              background: `${theme.colors.accent}18`,
              borderRadius: radius,
              padding: "16px 18px",
              borderLeft: `4px solid ${theme.colors.accent}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: event.time ? 6 : 0 }}>
              <span style={{ fontSize: 18 }}>📅</span>
              <div>
                {event.date && (
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.fg }}>
                    {formatDate(event.date)}
                  </div>
                )}
                {(event.endDate && event.endDate !== event.date) && (
                  <div style={{ fontSize: 12, color: theme.colors.fg, opacity: 0.65, marginTop: 2 }}>
                    — {formatDate(event.endDate)}
                  </div>
                )}
              </div>
            </div>
            {(event.time || event.endTime) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  paddingLeft: 2,
                }}
              >
                <span style={{ fontSize: 16 }}>🕐</span>
                <span style={{ fontSize: 13, color: theme.colors.fg, opacity: 0.8 }}>
                  {event.time && formatTime(event.time)}
                  {event.time && event.endTime && " – "}
                  {event.endTime && formatTime(event.endTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mekan */}
      {event.location && (
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              background: `${theme.colors.fg}08`,
              borderRadius: radius,
              padding: "14px 16px",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>📍</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.fg }}>
                {event.location}
              </div>
              {event.locationUrl && (
                <a
                  href={event.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    color: theme.colors.accent,
                    textDecoration: "underline",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  Haritada Aç →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Açıklama */}
      {event.description && (
        <div style={{ padding: "0 20px 20px" }}>
          <p
            style={{
              fontSize: 13,
              color: theme.colors.fg,
              opacity: 0.8,
              lineHeight: 1.7,
            }}
          >
            {event.description}
          </p>
        </div>
      )}

      {/* RSVP Butonu */}
      {rsvp.enabled && rsvp.url && (
        <div style={{ padding: "0 20px 20px" }}>
          <a
            href={rsvp.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              background: theme.colors.accent,
              color: "#fff",
              borderRadius: radius,
              padding: "14px 16px",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            {rsvp.buttonText || "Katılacağım"}
          </a>
        </div>
      )}
      {rsvp.enabled && !rsvp.url && (
        <div style={{ padding: "0 20px 20px" }}>
          <div
            style={{
              display: "block",
              background: theme.colors.accent,
              color: "#fff",
              borderRadius: radius,
              padding: "14px 16px",
              fontSize: 15,
              fontWeight: 700,
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            {rsvp.buttonText || "Katılacağım"}
          </div>
        </div>
      )}

      {/* Organizatör */}
      {hasOrganizer && (
        <div style={{ padding: "0 20px" }}>
          <div
            style={{
              background: `${theme.colors.fg}08`,
              borderRadius: radius,
              padding: "14px 16px",
              fontSize: 13,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                opacity: 0.5,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Organizatör
            </div>
            {organizer.name && (
              <div style={{ fontWeight: 600, marginBottom: 4, color: theme.colors.fg }}>
                {organizer.name}
              </div>
            )}
            {organizer.phone && (
              <a
                href={`tel:${organizer.phone}`}
                style={{
                  display: "block",
                  color: theme.colors.fg,
                  opacity: 0.75,
                  textDecoration: "none",
                  marginBottom: 2,
                }}
              >
                📞 {organizer.phone}
              </a>
            )}
            {organizer.email && (
              <a
                href={`mailto:${organizer.email}`}
                style={{
                  display: "block",
                  color: theme.colors.fg,
                  opacity: 0.75,
                  textDecoration: "none",
                }}
              >
                ✉️ {organizer.email}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
