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
      title="Projeyi sil"
      style={{
        display: "grid",
        placeItems: "center",
        width: 34,
        height: 34,
        borderRadius: 12,
        border: "1px solid rgba(239,68,68,0.2)",
        background: "rgba(239,68,68,0.07)",
        color: "var(--color-danger)",
        fontSize: 13,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.4 : 1,
        transition: "all 200ms",
        fontFamily: "inherit",
      }}
    >
      {loading ? "…" : "🗑"}
    </button>
  );
}
