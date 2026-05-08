"use client";

import { useEffect } from "react";
import type { CampaignLinkV1Type } from "@/schemas/campaign_link/v1";

/**
 * Campaign link renderer.
 * Kullanıcı QR'ı taradığında hedef URL'e redirect eder.
 * UTM parametreleri otomatik eklenir.
 */
export function CampaignLinkRenderer({
  content,
}: {
  content: CampaignLinkV1Type;
}) {
  useEffect(() => {
    if (!content.url) return;

    try {
      const url = new URL(content.url);

      // UTM parametrelerini ekle (sadece dolu olanları)
      if (content.utmSource) url.searchParams.set("utm_source", content.utmSource);
      if (content.utmMedium) url.searchParams.set("utm_medium", content.utmMedium);
      if (content.utmCampaign) url.searchParams.set("utm_campaign", content.utmCampaign);

      window.location.replace(url.toString());
    } catch {
      // Geçersiz URL — fallback göster
    }
  }, [content.url, content.utmSource, content.utmMedium, content.utmCampaign]);

  // Yönlendirme öncesi kısa bekleme ekranı
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        fontFamily: "system-ui, sans-serif",
        padding: "32px 20px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {content.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.imageUrl}
            alt={content.title ?? ""}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto 16px",
              display: "block",
              border: "2px solid #e5e7eb",
            }}
          />
        )}
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔗</div>
        {content.title && (
          <p style={{ fontWeight: 600, color: "#111827", marginBottom: 6, fontSize: 16 }}>
            {content.title}
          </p>
        )}
        {content.url ? (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            Yönlendiriliyorsunuz…
          </p>
        ) : (
          <p style={{ fontSize: 13, color: "#ef4444" }}>
            Hedef URL tanımlanmamış.
          </p>
        )}
        {content.url && (
          <a
            href={content.url}
            style={{
              display: "inline-block",
              marginTop: 16,
              fontSize: 12,
              color: "#3b82f6",
              textDecoration: "underline",
            }}
          >
            Otomatik yönlendirme çalışmıyorsa tıklayın
          </a>
        )}
      </div>
    </div>
  );
}
