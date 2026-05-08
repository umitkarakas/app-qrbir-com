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

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          handleDownload("png");
        }}
        disabled={loading}
        title="QR PNG indir"
        className="text-xs text-gray-500 hover:text-black px-2 py-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        {loading ? "⏳" : "⬛"} QR
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          handleDownload("svg");
        }}
        disabled={loading}
        title="QR SVG indir (vektörel)"
        className="text-xs text-gray-400 hover:text-black px-1.5 py-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        SVG
      </button>
    </div>
  );
}
