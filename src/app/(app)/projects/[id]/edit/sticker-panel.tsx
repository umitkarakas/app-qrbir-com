"use client";

import { useState, useEffect } from "react";
import { TableStickerTemplate } from "@/components/sticker-templates/table-sticker";
import { DoorStickerTemplate } from "@/components/sticker-templates/door-sticker";
import { GoogleReviewStickerTemplate } from "@/components/sticker-templates/google-review-sticker";

type Template = "table" | "door" | "google_review";

const TEMPLATE_LABELS: Record<Template, string> = {
  table: "Masa Sticker",
  door: "Kapı / Duvar",
  google_review: "Google Yorum",
};

const WC_PRODUCTS: Record<Template, string | undefined> = {
  table: process.env.NEXT_PUBLIC_WC_TABLE_STICKER_ID,
  door: process.env.NEXT_PUBLIC_WC_DOOR_STICKER_ID,
  google_review: process.env.NEXT_PUBLIC_WC_GOOGLE_STICKER_ID,
};

export function StickerPanel({
  projectId,
  projectTitle,
  projectType,
  publicUrl,
}: {
  projectId: number;
  projectTitle: string;
  projectType: string;
  publicUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<Template>("table");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loadingQr, setLoadingQr] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const isGoogleReview = projectType === "google_review";
  const templates: Template[] = isGoogleReview
    ? ["google_review", "table", "door"]
    : ["table", "door"];

  // QR kodunu data URL olarak yükle
  useEffect(() => {
    if (!open) return;
    setLoadingQr(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      setQrDataUrl(canvas.toDataURL("image/png"));
      setLoadingQr(false);
    };
    img.onerror = () => {
      setQrDataUrl("");
      setLoadingQr(false);
    };
    img.src = `/api/projects/${projectId}/qr?format=png&size=400`;
  }, [open, projectId]);

  async function handleOrder() {
    setOrderLoading(true);
    setOrderError(null);
    try {
      const wcProductId = WC_PRODUCTS[template];
      const res = await fetch(`/api/projects/${projectId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "physical_product",
          wcProductId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error ?? "Hata oluştu.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setOrderError("Bağlantı hatası.");
    } finally {
      setOrderLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          🏷️ Sticker / Stand Önizleme
        </span>
        <span className="text-xs text-gray-400 select-none">
          {open ? "▲ Kapat" : "▼ Göster"}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Şablon seçimi */}
          <div className="flex gap-2 flex-wrap">
            {templates.map((t) => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  template === t
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {TEMPLATE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Önizleme */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-full sm:w-64 shrink-0 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-4" style={{ minHeight: 220 }}>
              {loadingQr ? (
                <div className="text-xs text-gray-400 text-center">QR kod yükleniyor...</div>
              ) : (
                <>
                  {template === "table" && (
                    <div className="w-40 h-40">
                      <TableStickerTemplate
                        title={projectTitle}
                        qrDataUrl={qrDataUrl}
                        ctaText="QR kodu okutun"
                      />
                    </div>
                  )}
                  {template === "door" && (
                    <div className="w-28 h-56">
                      <DoorStickerTemplate
                        title={projectTitle}
                        qrDataUrl={qrDataUrl}
                        ctaText="Menüyü gör"
                      />
                    </div>
                  )}
                  {template === "google_review" && (
                    <div className="w-56 h-36">
                      <GoogleReviewStickerTemplate
                        businessName={projectTitle}
                        qrDataUrl={qrDataUrl}
                        ctaText="Bizi değerlendirin"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sağ bilgi */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {TEMPLATE_LABELS[template]}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  QR kodunuz bu stickere yerleştirilecek. Baskı için sipariş verin.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 break-all">
                {publicUrl}
              </div>

              <p className="text-xs text-gray-400">
                Bu önizleme tasarım hakkında fikir verir. Gerçek baskı ürünü için sipariş oluşturun.
              </p>

              {orderError && (
                <p className="text-xs text-red-600">{orderError}</p>
              )}

              <button
                onClick={handleOrder}
                disabled={orderLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50 transition-all shadow-sm"
              >
                {orderLoading ? "Yönlendiriliyor..." : "🛒 Baskı Siparişi Ver →"}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-400">
            Sticker siparişleri qrbir.com üzerinden yönetilir. Ödemeniz tamamlandıktan sonra baskı sürecine alınır.
          </p>
        </div>
      )}
    </div>
  );
}
