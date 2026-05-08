"use client";

import { ReactNode, useState } from "react";

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";

export function SaveBar({
  saving,
  message,
  error,
  onSave,
}: {
  saving: boolean;
  message: string;
  error: string;
  onSave: () => void;
}) {
  return (
    <div className="sticky bottom-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3 flex items-center justify-between mt-6">
      <div className="text-sm">
        {error ? (
          <span className="text-red-600">{error}</span>
        ) : message ? (
          <span className="text-green-600">{message}</span>
        ) : (
          <span className="text-gray-400">Değişiklikleri kaydetmeyi unutmayın</span>
        )}
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        className="bg-black text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40"
      >
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </div>
  );
}

export function useSaver(projectId: number) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(content: unknown) {
    setError("");
    setMessage("");
    setSaving(true);

    const res = await fetch(`/api/projects/${projectId}/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.issues) {
        setError("Doğrulama hatası — alanları kontrol edin");
      } else {
        setError(data.error ?? "Kaydedilemedi");
      }
      return false;
    }

    setMessage("Kaydedildi ✓");
    setTimeout(() => setMessage(""), 2500);
    return true;
  }

  return { saving, error, message, save };
}
