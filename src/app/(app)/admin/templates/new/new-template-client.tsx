"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ProductType =
  | "restaurant_menu"
  | "bio_link"
  | "brand_bio"
  | "google_review"
  | "event_invitation"
  | "campaign_link";

type ThemeOption = {
  id: number;
  name: string;
  productType: ProductType;
  status: string;
};

type Props = {
  themes: ThemeOption[];
};

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "restaurant_menu", label: "Restoran Menü" },
  { value: "bio_link", label: "Bio Link" },
  { value: "brand_bio", label: "Marka Bio" },
  { value: "google_review", label: "Google Yorum" },
  { value: "event_invitation", label: "Etkinlik" },
  { value: "campaign_link", label: "Kampanya" },
];

export function NewTemplateClient({ themes }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState<ProductType>("bio_link");
  const [themeId, setThemeId] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredThemes = useMemo(
    () => themes.filter((theme) => theme.productType === productType),
    [productType, themes]
  );

  function updateName(value: string) {
    setName(value);
    if (!slug.trim()) setSlug(slugify(value));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slugify(slug),
          description: description.trim() || null,
          productType,
          themeId: themeId ? Number(themeId) : null,
          blocks: [],
          settings: {},
          metadata: {},
          previewInfo: {},
          isPremium,
          isActive,
          category: category.trim() || null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Şablon oluşturulamadı");
      router.push(`/admin/templates/${data.id}/edit`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Şablon oluşturulamadı");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/admin/templates" className="text-sm text-gray-500 hover:text-gray-800">
            ← Şablonlar
          </Link>
          <span className="text-sm text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700">Yeni Şablon</span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-gray-900">Yeni Şablon Ekle</h1>
          <p className="mt-1 text-sm text-gray-500">
            Önce temel kaydı oluşturun; blok kompozisyonunu sonraki ekranda düzenleyin.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Şablon Adı</label>
              <input
                value={name}
                onChange={(event) => updateName(event.target.value)}
                maxLength={120}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="Örn. Premium Kafe Menü"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Slug</label>
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                maxLength={120}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="premium-kafe-menu"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Ürün Tipi</label>
              <select
                value={productType}
                onChange={(event) => {
                  setProductType(event.target.value as ProductType);
                  setThemeId("");
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                {PRODUCT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Varsayılan Tasarım</label>
              <select
                value={themeId}
                onChange={(event) => setThemeId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="">Tasarım bağlama</option>
                {filteredThemes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name} ({theme.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="Bu şablon ne için kullanılacak?"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Kategori</label>
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  maxLength={80}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="kafe, kurumsal..."
                />
              </div>
              <div className="flex items-end gap-4 pb-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                  Aktif
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={isPremium} onChange={(event) => setIsPremium(event.target.checked)} />
                  Premium
                </label>
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={!name.trim() || !slug.trim() || saving}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Oluşturuluyor..." : "Oluştur ve Düzenle"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
