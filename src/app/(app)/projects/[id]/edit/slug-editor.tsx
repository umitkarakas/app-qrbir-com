"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SlugEditor({
  projectId,
  initialSlug,
  subdomainType,
}: {
  projectId: number;
  initialSlug: string;
  subdomainType: string;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initialSlug);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialSlug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const domain = `${subdomainType}.qrbir.com`;

  function sanitize(val: string) {
    return val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .slice(0, 60);
  }

  async function save() {
    const clean = sanitize(draft);
    if (!clean || clean === slug) {
      setDraft(slug);
      setEditing(false);
      return;
    }
    setError("");
    setSaving(true);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: clean }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kaydedilemedi");
      return;
    }
    setSlug(clean);
    setEditing(false);
    router.refresh(); // PublishBar ve QrPanel'i güncelle
  }

  function cancel() {
    setDraft(slug);
    setError("");
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <span className="font-mono text-gray-400">{domain}/</span>
          <input
            className="border-b-2 border-black bg-transparent outline-none font-mono text-gray-900 min-w-0 w-40"
            value={draft}
            onChange={(e) => setDraft(sanitize(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            autoFocus
            maxLength={60}
          />
          <button
            onClick={save}
            disabled={saving}
            className="text-xs font-semibold text-green-600 hover:text-green-800 disabled:opacity-40"
          >
            {saving ? "…" : "Kaydet"}
          </button>
          <button
            onClick={cancel}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            İptal
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <p className="text-[11px] text-amber-600">
          ⚠ Slug değiştirilirse mevcut QR kodlar ve paylaşılan linkler çalışmaz.
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(slug);
        setError("");
        setEditing(true);
      }}
      className="group flex items-center gap-1 mt-1 text-left"
    >
      <span className="text-sm text-gray-400 font-mono">
        {domain}/<span className="text-gray-600">{slug}</span>
      </span>
      <span className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
        ✎
      </span>
    </button>
  );
}
