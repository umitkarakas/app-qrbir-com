"use client";

import { useState } from "react";

interface Props {
  projectId: number;
  /** WooCommerce ürün ID'si (dijital plan, studio hizmeti vs.) */
  wcProductId?: string;
  orderType?: "digital_plan" | "studio_service";
  label?: string;
}

/**
 * "Ödemeye Geç" butonu.
 * Tıklandığında /api/projects/[id]/checkout çağrır ve dönen WooCommerce URL'ine yönlendirir.
 */
export function CheckoutButton({
  projectId,
  wcProductId,
  orderType = "digital_plan",
  label = "Ödemeye Geç →",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderType, wcProductId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Hata oluştu.");
        return;
      }
      // WooCommerce ödeme sayfasına yönlendir
      window.location.href = data.url;
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-sm"
      >
        {loading ? "Yönlendiriliyor..." : label}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
