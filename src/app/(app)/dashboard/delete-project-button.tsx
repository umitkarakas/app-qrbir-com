"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProjectButton({
  projectId,
  projectTitle,
}: {
  projectId: number;
  projectTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); // Link'in yönlendirmesini engelle
    e.stopPropagation();

    if (
      !confirm(
        `"${projectTitle}" projesini kalıcı olarak silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`
      )
    )
      return;

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Proje silinemedi");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded transition-colors disabled:opacity-40"
      title="Projeyi sil"
    >
      {loading ? "…" : "Sil"}
    </button>
  );
}
