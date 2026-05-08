"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ActivateButton({ projectId }: { projectId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleActivate() {
    if (!confirm(`Proje #${projectId}'yi manuel olarak yayınlamak istediğinizden emin misiniz?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/activate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Hata");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  if (done) return <span className="text-xs text-green-600 font-medium">✓ Yayınlandı</span>;

  return (
    <div>
      <button
        onClick={handleActivate}
        disabled={loading}
        className="text-xs text-green-600 hover:text-green-800 font-medium whitespace-nowrap disabled:opacity-50"
        title="Webhook çalışmadıysa manuel olarak projeyi yayınla"
      >
        {loading ? "…" : "Manuel Aktive Et"}
      </button>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
