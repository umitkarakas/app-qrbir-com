/**
 * Google Yorum sticker — 85×55 mm (kartvizit formatı)
 * Yatay, sağda QR kodu, solda metin
 */
export function GoogleReviewStickerTemplate({
  businessName,
  ctaText,
  qrDataUrl,
}: {
  businessName: string;
  ctaText?: string;
  qrDataUrl: string;
}) {
  const cta = ctaText || "Bizi değerlendirin";

  return (
    <svg
      viewBox="0 0 340 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", fontFamily: "system-ui, sans-serif" }}
    >
      {/* Arka plan */}
      <rect width="340" height="220" rx="16" fill="white" />
      <rect width="340" height="220" rx="16" fill="none" stroke="#e5e7eb" strokeWidth="2" />

      {/* Sol renk şeridi */}
      <rect width="8" height="220" rx="4" fill="#4285F4" />

      {/* Google logosu (renkli G harfi yorumu) */}
      <circle cx="48" cy="56" r="22" fill="#4285F4" opacity="0.1" />
      <text x="48" y="65" textAnchor="middle" fill="#4285F4" fontSize="26" fontWeight="900">
        G
      </text>

      {/* Google yazısı */}
      <text x="76" y="54" fill="#4285F4" fontSize="13" fontWeight="700">oogle</text>
      <text x="76" y="70" fill="#6b7280" fontSize="10">Yorum</text>

      {/* Yıldızlar */}
      {[0, 1, 2, 3, 4].map((i) => (
        <text key={i} x={28 + i * 18} y="102" fontSize="16" fill="#FBBC04">
          ★
        </text>
      ))}

      {/* İşletme adı */}
      <text
        x="28"
        y="130"
        fill="#111827"
        fontSize="15"
        fontWeight="700"
      >
        {businessName.length > 20 ? businessName.slice(0, 20) + "…" : businessName}
      </text>

      {/* CTA */}
      <text x="28" y="152" fill="#6b7280" fontSize="11">
        {cta.length > 28 ? cta.slice(0, 28) + "…" : cta}
      </text>

      {/* QR kodu — sağ taraf */}
      <image
        href={qrDataUrl}
        x="200"
        y="20"
        width="120"
        height="120"
        preserveAspectRatio="xMidYMid meet"
      />

      <text x="260" y="158" textAnchor="middle" fill="#9ca3af" fontSize="9">
        QR kodu okutun
      </text>

      {/* Alt divider + footer */}
      <line x1="28" y1="175" x2="312" y2="175" stroke="#f3f4f6" strokeWidth="1" />
      <text x="170" y="196" textAnchor="middle" fill="#d1d5db" fontSize="9">
        qrbir.com
      </text>
    </svg>
  );
}
