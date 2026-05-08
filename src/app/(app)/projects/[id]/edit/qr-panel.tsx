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
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          📱 QR Kod
        </span>
        <span className="text-xs text-gray-400 select-none">
          {open ? "▲ Kapat" : "▼ Göster"}
        </span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col sm:flex-row items-start gap-6">
          {/* QR Görüntüsü */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="QR Kod"
            className="w-36 h-36 border border-gray-200 rounded-xl shrink-0"
          />

          {/* Bilgi + İndirme */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Kodlanan adres:</p>
            <p className="text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-1.5 break-all mb-4">
              {publicUrl}
            </p>

            <div className="flex gap-2 flex-wrap">
              <a
                href={downloadPng}
                download={`qr-kod.png`}
                className="text-xs font-medium bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                ↓ PNG İndir (yüksek çözünürlük)
              </a>
              <a
                href={downloadSvg}
                download={`qr-kod.svg`}
                className="text-xs font-medium bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ↓ SVG İndir
              </a>
            </div>

            <p className="text-[11px] text-gray-400 mt-2">
              Baskı materyalleri için SVG veya yüksek çözünürlüklü PNG kullanın.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
