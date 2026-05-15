"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface BlockTypeActionsProps {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: "common" | "menu" | "invitation" | "bio_link";
  allowedSiteTypes: string[];
  isEnabled: boolean;
  isPro: boolean;
  sortOrder: number;
}

const CATEGORY_OPTIONS = [
  { value: "common", label: "Temel" },
  { value: "menu", label: "Restoran" },
  { value: "invitation", label: "Etkinlik" },
  { value: "bio_link", label: "Bio Link" },
] as const;

const SITE_TYPE_OPTIONS = [
  { value: "digital_menu", label: "Dijital Menü" },
  { value: "digital_invitation", label: "Dijital Davet" },
  { value: "bio_link", label: "Bio Link" },
];

export function BlockTypeActions({
  id,
  name,
  description,
  icon,
  category,
  allowedSiteTypes,
  isEnabled,
  isPro,
  sortOrder,
}: BlockTypeActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<"enabled" | "pro" | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name,
    description: description ?? "",
    icon,
    category,
    allowedSiteTypes,
    isEnabled,
    isPro,
    sortOrder,
  });

  async function patch(payload: Record<string, unknown>, type: "enabled" | "pro") {
    setPending(type);
    try {
      const res = await fetch(`/api/admin/block-types/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Blok güncellenemedi");
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Blok güncellenemedi");
    } finally {
      setPending(null);
    }
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/block-types/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          icon: form.icon.trim(),
          category: form.category,
          allowedSiteTypes: form.allowedSiteTypes,
          isEnabled: form.isEnabled,
          isPro: form.isPro,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Blok güncellenemedi");
      }
      setEditOpen(false);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Blok güncellenemedi");
    } finally {
      setSaving(false);
    }
  }

  function toggleSiteType(siteType: string) {
    setForm((prev) => ({
      ...prev,
      allowedSiteTypes: prev.allowedSiteTypes.includes(siteType)
        ? prev.allowedSiteTypes.filter((item) => item !== siteType)
        : [...prev.allowedSiteTypes, siteType],
    }));
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
        >
          Düzenle
        </button>
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => patch({ isPro: !isPro }, "pro")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isPro
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          } disabled:opacity-60`}
        >
          {pending === "pro" ? "..." : isPro ? "Pro" : "Free"}
        </button>
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => patch({ isEnabled: !isEnabled }, "enabled")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isEnabled
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          } disabled:opacity-60`}
        >
          {pending === "enabled" ? "..." : isEnabled ? "Aktif" : "Kapalı"}
        </button>
      </div>

      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Blok Düzenle</h2>
                <p className="text-xs text-gray-500">{id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                Kapat
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Ad">
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Açıklama">
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Icon">
                  <input
                    value={form.icon}
                    onChange={(event) => setForm({ ...form, icon: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="Kategori">
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value as typeof form.category })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Sıra">
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </Field>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-gray-700">Site Tipleri</div>
                <div className="flex flex-wrap gap-3">
                  {SITE_TYPE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.allowedSiteTypes.includes(option.value)}
                        onChange={() => toggleSiteType(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(event) => setForm({ ...form, isEnabled: event.target.checked })}
                  />
                  Aktif
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isPro}
                    onChange={(event) => setForm({ ...form, isPro: event.target.checked })}
                  />
                  Pro
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={!form.name.trim() || !form.icon.trim() || saving}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
