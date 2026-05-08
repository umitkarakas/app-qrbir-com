"use client";

import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  /** Önizleme şekli: "square" veya "circle" (varsayılan: "square") */
  shape?: "square" | "circle";
}

/**
 * Görsel yükleme bileşeni.
 * - Sürükle bırak veya tıkla
 * - /api/upload endpoint'ine POST atar
 * - Dönen URL'yi onChange ile iletir
 * - URL alanı da mevcuttur (alternatif giriş)
 */
export function ImageUploader({ value, onChange, label, hint, shape = "square" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Yükleme başarısız");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    uploadFile(files[0]);
  }

  const previewClass = shape === "circle"
    ? "rounded-full"
    : "rounded-xl";

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="flex items-start gap-3">
        {/* Önizleme */}
        <div
          className={`shrink-0 w-20 h-20 border-2 ${dragging ? "border-blue-400 bg-blue-50" : "border-dashed border-gray-300"} ${previewClass} flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 transition-colors`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className={`w-full h-full object-cover ${previewClass}`}
            />
          ) : (
            <span className="text-2xl text-gray-300 select-none">
              {uploading ? "⏳" : "📷"}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Yükle butonu */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs font-medium bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {uploading ? "Yükleniyor..." : value ? "Değiştir" : "Görsel Yükle"}
          </button>

          {/* URL ile ekle toggle */}
          <button
            type="button"
            onClick={() => setShowUrl((v) => !v)}
            className="block text-xs text-gray-400 hover:text-gray-600"
          >
            {showUrl ? "▲ URL'yi kapat" : "veya URL girin"}
          </button>

          {showUrl && (
            <input
              type="url"
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="https://..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          )}

          {hint && !error && (
            <p className="text-xs text-gray-400">{hint}</p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-red-500 hover:text-red-700"
            >
              × Kaldır
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
