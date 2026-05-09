"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listTemplates } from "@/lib/theme-editor/registry";
import type { ProjectType } from "@/lib/theme-editor/contract";

const PRODUCT_TYPES: { value: ProjectType; label: string; description: string }[] = [
  { value: "bio_link", label: "Bio Link", description: "Kişisel veya marka bağlantı sayfası" },
  { value: "restaurant_menu", label: "Restoran Menü", description: "Dijital QR menü sayfası" },
  { value: "brand_bio", label: "Marka Bio", description: "Kurumsal marka bio sayfası" },
  { value: "google_review", label: "Google Yorum", description: "Google yorum yönlendirme sayfası" },
  { value: "event_invitation", label: "Etkinlik", description: "Etkinlik davet sayfası" },
  { value: "campaign_link", label: "Kampanya", description: "UTM takipli yönlendirme" },
];

export default function NewThemePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [productType, setProductType] = useState<ProjectType | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templates = productType ? listTemplates(productType) : [];

  async function handleCreate() {
    if (!productType || !templateId || !name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), productType, templateId, isFree, isPremium }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Bir hata oluştu");
        return;
      }
      const created = await res.json();
      router.push(`/admin/themes/${created.id}/edit`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/themes" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Temalar
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600 font-medium">Yeni Tema</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Tema Oluştur</h1>

        {/* Adım 1: Ürün tipi seç */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            1. Ürün Tipi
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCT_TYPES.map((pt) => {
              const available = listTemplates(pt.value).length > 0;
              return (
                <button
                  key={pt.value}
                  onClick={() => {
                    if (!available) return;
                    setProductType(pt.value);
                    setTemplateId(null);
                    setStep(2);
                  }}
                  disabled={!available}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    productType === pt.value
                      ? "border-violet-500 bg-violet-50"
                      : available
                      ? "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50 cursor-pointer"
                      : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="font-semibold text-gray-900 text-sm">{pt.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{pt.description}</div>
                  {!available && (
                    <div className="text-xs text-gray-400 mt-1">Yakında</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Adım 2: Template seç + isim */}
        {step === 2 && productType && templates.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                2. Tasarım Şablonu
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      templateId === t.id
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-200 bg-white hover:border-violet-300 cursor-pointer"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t.capabilities.join(" · ")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {templateId && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    3. Tema Adı
                  </h2>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="örn. Koyu Minimal"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="rounded"
                    />
                    Ücretsiz
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="rounded"
                    />
                    Premium
                  </label>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  onClick={handleCreate}
                  disabled={!name.trim() || loading}
                  className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Oluşturuluyor…" : "Oluştur ve Düzenlemeye Başla"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
