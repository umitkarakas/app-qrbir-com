"use client";

import { useState } from "react";

export function QrDownloadButton({
  projectId,
  slug,
}: {
  projectId: number;
  slug: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload(format: "png" | "svg") {
    setLoading(true);
    try {
      const url = `/api/projects/${projectId}/qr?format=${format}&size=600`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("QR oluşturulamadı");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${slug}.${format}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert("QR indirilemedi, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const btnStyle = {
    display: "grid",
    placeItems: "center",
    height: 34,
    padding: "0 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.65)",
    background: "rgba(255,255,255,0.55)",
    color: "var(--color-fg-2)",
    fontSize: 11,
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.5 : 1,
    transition: "all 200ms",
    fontFamily: "inherit",
  } as const;

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        onClick={(e) => { e.preventDefault(); handleDownload("png"); }}
        disabled={loading}
        title="QR PNG indir"
        style={btnStyle}
      >
        {loading ? "⏳" : "QR"}
      </button>
      <button
        onClick={(e) => { e.preventDefault(); handleDownload("svg"); }}
        disabled={loading}
        title="QR SVG indir (vektörel)"
        style={{ ...btnStyle, color: "var(--color-fg-3)" }}
      >
        SVG
      </button>
    </div>
  );
}
