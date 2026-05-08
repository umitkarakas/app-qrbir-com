/**
 * Masa sticker şablonu — 80×80 mm kare format
 * QR kodu ortada, altında CTA metni, üstte başlık
 */
export function TableStickerTemplate({
  title,
  ctaText,
  qrDataUrl,
  primaryColor = "#111827",
  accentColor = "#16a34a",
}: {
  title: string;
  ctaText?: string;
  qrDataUrl: string;
  primaryColor?: string;
  accentColor?: string;
}) {
  const cta = ctaText || "QR kodu okutun";

  return (
    <svg
      viewBox="0 0 320 320"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", fontFamily: "system-ui, sans-serif" }}
    >
      {/* Arka plan */}
      <rect width="320" height="320" rx="24" fill="white" />
      <rect width="320" height="320" rx="24" fill="none" stroke={primaryColor} strokeWidth="3" />

      {/* Üst renkli bant */}
      <rect width="320" height="54" rx="24" fill={primaryColor} />
      <rect x="0" y="30" width="320" height="24" fill={primaryColor} />

      {/* Başlık */}
      <text
        x="160"
        y="34"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="700"
        letterSpacing="0.5"
      >
        {title.length > 22 ? title.slice(0, 22) + "…" : title}
      </text>

      {/* QR kod */}
      <image
        href={qrDataUrl}
        x="60"
        y="68"
        width="200"
        height="200"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Alt CTA */}
      <rect x="20" y="280" width="280" height="28" rx="8" fill={accentColor} />
      <text
        x="160"
        y="299"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="600"
      >
        {cta.length > 30 ? cta.slice(0, 30) + "…" : cta}
      </text>

      {/* QRbir footer */}
      <text
        x="160"
        y="315"
        textAnchor="middle"
        fill="#9ca3af"
        fontSize="8"
      >
        qrbir.com
      </text>
    </svg>
  );
}
