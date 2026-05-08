"use client";

import { useState } from "react";
import type { GoogleReviewV1Type } from "@/schemas/google_review/v1";
import type { ThemeConfig } from "@/types/theme";
import { FONT_MAP, RADIUS_MAP, bgStyle } from "@/types/theme";

type Phase = "rate" | "google" | "feedback";

export function GoogleReviewRenderer({
  content,
  theme,
}: {
  content: GoogleReviewV1Type;
  theme: ThemeConfig;
}) {
  const colors = theme.colors;
  const font = FONT_MAP[theme.font ?? "sans"];
  const radius = RADIUS_MAP[theme.radius ?? "md"];
  const [stars, setStars] = useState(0);
  const [phase, setPhase] = useState<Phase>("rate");
  const [feedbackText, setFeedbackText] = useState("");

  function handleCta() {
    if (stars === 0) return;
    if (stars >= content.ratingThreshold) {
      setPhase("google");
    } else {
      setPhase("feedback");
    }
  }

  function reset() {
    setStars(0);
    setPhase("rate");
    setFeedbackText("");
  }

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
        padding: "40px 24px 32px",
      }}
    >
      {/* Logo & İşletme adı */}
      {content.business.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.business.logoUrl}
          alt=""
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            objectFit: "cover",
            border: `3px solid ${colors.accent}`,
            marginBottom: 14,
          }}
        />
      ) : (
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            marginBottom: 14,
          }}
        >
          ⭐
        </div>
      )}

      <div
        style={{
          fontWeight: 700,
          fontSize: 18,
          textAlign: "center",
          marginBottom: content.business.description ? 6 : 28,
        }}
      >
        {content.business.name || "İşletme Adı"}
      </div>

      {content.business.description && (
        <div
          style={{
            fontSize: 12,
            textAlign: "center",
            opacity: 0.7,
            marginBottom: 28,
            maxWidth: 220,
            lineHeight: 1.5,
          }}
        >
          {content.business.description}
        </div>
      )}

      {/* --- Aşama: Yıldız seçimi --- */}
      {phase === "rate" && (
        <>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Deneyiminizi değerlendirin
          </div>

          {/* Yıldızlar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setStars(n)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 36,
                  padding: 2,
                  color: n <= stars ? colors.accent : "#d1d5db",
                  transition: "transform 0.1s",
                  transform: n <= stars ? "scale(1.1)" : "scale(1)",
                }}
              >
                ★
              </button>
            ))}
          </div>

          <button
            onClick={handleCta}
            disabled={stars === 0}
            style={{
              background: stars > 0 ? colors.accent : "#d1d5db",
              color: "#fff",
              border: "none",
              borderRadius: radius,
              padding: "13px 32px",
              fontSize: 15,
              fontWeight: 700,
              cursor: stars > 0 ? "pointer" : "default",
              width: "100%",
              fontFamily: font,
              transition: "background 0.2s",
            }}
          >
            {content.ctaText || "Devam Et"}
          </button>

          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 12, textAlign: "center" }}>
            {content.ratingThreshold} yıldız ve üzeri Google&apos;a yönlendirir
          </div>
        </>
      )}

      {/* --- Aşama: Google yönlendirmesi --- */}
      {phase === "google" && (
        <div style={{ textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            Teşekkürler!
          </div>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 28, lineHeight: 1.5 }}>
            Google Haritalar&apos;da yorum bırakmak
            <br />
            için yönlendiriliyorsunuz…
          </div>
          <div
            style={{
              background: colors.accent,
              color: "#fff",
              borderRadius: radius,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Google&apos;da Yorum Bırak
          </div>
          <button
            onClick={reset}
            style={{
              background: "none",
              border: "none",
              color: colors.muted ?? colors.fg,
              fontSize: 12,
              cursor: "pointer",
              opacity: 0.6,
              fontFamily: font,
            }}
          >
            ← Geri dön
          </button>
        </div>
      )}

      {/* --- Aşama: İç geri bildirim --- */}
      {phase === "feedback" && (
        <div style={{ textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
            Görüşünüzü paylaşın
          </div>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 20, lineHeight: 1.5 }}>
            Deneyiminizi geliştirmemize yardımcı olun
          </div>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Deneyiminizi anlatın…"
            rows={4}
            style={{
              width: "100%",
              border: `1px solid ${colors.border ?? "#e5e7eb"}`,
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: 13,
              fontFamily: font,
              resize: "none",
              background: colors.card ?? "#fff",
              color: colors.cardFg ?? colors.fg,
              boxSizing: "border-box",
              marginBottom: 12,
            }}
          />
          <button
            style={{
              background: colors.accent,
              color: "#fff",
              border: "none",
              borderRadius: radius,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
              fontFamily: font,
              marginBottom: 8,
            }}
          >
            Gönder
          </button>
          <button
            onClick={reset}
            style={{
              background: "none",
              border: "none",
              color: colors.muted ?? colors.fg,
              fontSize: 12,
              cursor: "pointer",
              opacity: 0.6,
              fontFamily: font,
            }}
          >
            ← Geri dön
          </button>
        </div>
      )}
    </div>
  );
}
