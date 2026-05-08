/**
 * Kapı / duvara yapıştırma sticker — dikey uzun format (60×120 mm)
 */
export function DoorStickerTemplate({
  title,
  subtitle,
  ctaText,
  qrDataUrl,
  primaryColor = "#111827",
  accentColor = "#2563eb",
}: {
  title: string;
  subtitle?: string;
  ctaText?: string;
  qrDataUrl: string;
  primaryColor?: string;
  accentColor?: string;
}) {
  const cta = ctaText || "Menüyü gör";
  const sub = subtitle || "";

  return (
    <svg
      viewBox="0 0 240 480"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", fontFamily: "system-ui, sans-serif" }}
    >
      {/* Arka plan */}
      <rect width="240" height="480" rx="20" fill="white" />
      <rect width="240" height="480" rx="20" fill="none" stroke={primaryColor} strokeWidth="3" />

      {/* Üst bant */}
      <rect width="240" height="90" rx="20" fill={primaryColor} />
      <rect x="0" y="70" width="240" height="20" fill={primaryColor} />

      {/* Başlık */}
      <text
        x="120"
        y="42"
        textAnchor="middle"
        fill="white"
        fontSize="20"
        fontWeight="800"
      >
        {title.length > 16 ? title.slice(0, 16) + "…" : title}
      </text>

      {subtitle && (
        <text
          x="120"
          y="68"
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize="12"
          fontWeight="400"
        >
          {sub.length > 26 ? sub.slice(0, 26) + "…" : sub}
        </text>
      )}

      {/* QR kod */}
      <image
        href={qrDataUrl}
        x="40"
        y="105"
        width="160"
        height="160"
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Okuma talimatı oku */}
      <text x="120" y="290" textAnchor="middle" fill="#6b7280" fontSize="11">
        Kameranızı QR koda tutun
      </text>
      <line x1="60" y1="296" x2="180" y2="296" stroke="#e5e7eb" strokeWidth="1" />

      {/* CTA alt buton */}
      <rect x="20" y="316" width="200" height="36" rx="10" fill={accentColor} />
      <text
        x="120"
        y="339"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="700"
      >
        {cta.length > 22 ? cta.slice(0, 22) + "…" : cta}
      </text>

      {/* Dekoratif nokta deseni */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={40 + i * 40}
          cy={390}
          r="4"
          fill={i === 2 ? accentColor : "#e5e7eb"}
        />
      ))}

      {/* Alt bilgi */}
      <text x="120" y="430" textAnchor="middle" fill="#9ca3af" fontSize="10">
        Bu sticker QRbir.com ile hazırlandı
      </text>
    </svg>
  );
}
