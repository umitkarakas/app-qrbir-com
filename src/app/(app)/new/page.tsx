"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProjectType =
  | "restaurant_menu"
  | "bio_link"
  | "brand_bio"
  | "google_review"
  | "event_invitation"
  | "campaign_link";

const PRODUCT_TYPES: {
  type: ProjectType;
  label: string;
  description: string;
  subdomain: string;
  icon: string;
}[] = [
  {
    type: "restaurant_menu",
    label: "Restoran Menüsü",
    description: "Dijital QR menü oluşturun",
    subdomain: "m.qrbir.com",
    icon: "🍽️",
  },
  {
    type: "bio_link",
    label: "Bio Link",
    description: "Tüm linklerinizi tek sayfada toplayın",
    subdomain: "b.qrbir.com",
    icon: "🔗",
  },
  {
    type: "brand_bio",
    label: "Marka Bio",
    description: "Kurumsal marka sayfası oluşturun",
    subdomain: "b.qrbir.com",
    icon: "🏢",
  },
  {
    type: "google_review",
    label: "Google Yorum",
    description: "Müşterileri değerlendirmeye yönlendirin",
    subdomain: "r.qrbir.com",
    icon: "⭐",
  },
  {
    type: "event_invitation",
    label: "Etkinlik Daveti",
    description: "Dijital davetiye ve etkinlik sayfası",
    subdomain: "e.qrbir.com",
    icon: "🎉",
  },
  {
    type: "campaign_link",
    label: "Kampanya Linki",
    description: "Promosyon ve kampanya sayfası",
    subdomain: "go.qrbir.com",
    icon: "📣",
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<ProjectType | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectType: selected, title }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Proje oluşturulamadı.");
      return;
    }

    router.push("/dashboard");
  }

  const selectedProduct = PRODUCT_TYPES.find((p) => p.type === selected);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Ne oluşturmak istersiniz?
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Ürün tipini seçin, birkaç adımda yayına alın
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Geri
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {PRODUCT_TYPES.map((product) => (
            <button
              key={product.type}
              onClick={() => {
                setSelected(product.type);
                setTitle("");
                setError("");
              }}
              className={`
                text-left p-4 rounded-xl border-2 transition-all
                ${
                  selected === product.type
                    ? "border-black bg-white shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-400"
                }
              `}
            >
              <div className="text-2xl mb-2">{product.icon}</div>
              <div className="font-medium text-sm text-gray-900">
                {product.label}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {product.subdomain}
              </div>
            </button>
          ))}
        </div>

        {selected && selectedProduct && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              {selectedProduct.icon} {selectedProduct.label}
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proje adı
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder={`ör. ${selectedProduct.label}`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Slug otomatik oluşturulur:{" "}
                  <span className="font-mono">
                    {selectedProduct.subdomain}/
                    {title
                      ? title
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")
                          .slice(0, 30)
                      : "proje-adi"}
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || title.trim().length === 0}
                className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Oluşturuluyor…" : "Projeyi Oluştur"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
