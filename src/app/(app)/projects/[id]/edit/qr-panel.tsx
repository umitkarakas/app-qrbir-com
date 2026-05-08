"use client";

import { useState } from "react";

export function QrPanel({
  projectId,
  publicUrl,
}: {
  projectId: number;
  publicUrl: string;
}) {
  const [open, setOpen] = useState(false);

  const previewSrc = `/api/projects/${projectId}/qr?format=png&size=400`;
  const downloadPng = `/api/projects/${projectId}/qr?format=png&size=1200`;
  const downloadSvg = `/api/projects/${projectId}/qr?format=svg`;

  return (
    <div className="lum-glass" style={{ padding: "14px 20px", marginBottom: 10 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: 0, padding: 0, cursor: "pointer", fontFamily: "inherit" }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg-1)", display: "flex", alignItems: "center", gap: 6 }}>
          📱 QR Kod
        </span>
        <span style={{ fontSize: 11, color: "var(--color-fg-4)" }}>
          {open ? "▲ Kapat" : "▼ Göster"}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 20 }}>
          {/* QR Görüntüsü */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="QR Kod"
            style={{ width: 128, height: 128, borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }}
          />

          {/* Bilgi + İndirme */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--color-fg-3)" }}>Kodlanan adres:</p>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-fg-2)", background: "rgba(0,0,0,0.04)", borderRadius: 6, padding: "6px 8px", wordBreak: "break-all", border: "1px solid rgba(0,0,0,0.06)" }}>
              {publicUrl}
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a
                href={downloadPng}
                download="qr-kod.png"
                className="lum-cta"
                style={{ fontSize: 12, height: 34, padding: "0 14px", textDecoration: "none" }}
              >
                ↓ PNG İndir
              </a>
              <a
                href={downloadSvg}
                download="qr-kod.svg"
                style={{ fontSize: 12, height: 34, padding: "0 14px", display: "inline-flex", alignItems: "center", borderRadius: 10, border: "1px solid rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.55)", color: "var(--color-fg-2)", textDecoration: "none", fontWeight: 600 }}
              >
                ↓ SVG İndir
              </a>
            </div>

            <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--color-fg-4)" }}>
              Baskı materyalleri için SVG veya yüksek çözünürlüklü PNG kullanın.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
