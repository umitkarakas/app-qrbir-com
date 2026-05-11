"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface TemplateActionsProps {
  id: number;
  isActive: boolean;
  isPremium: boolean;
}

export function TemplateActions({ id, isActive, isPremium }: TemplateActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<"active" | "premium" | null>(null);

  async function patch(payload: Record<string, unknown>, type: "active" | "premium") {
    setPending(type);
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Şablon güncellenemedi");
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Şablon güncellenemedi");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => patch({ isPremium: !isPremium }, "premium")}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          isPremium
            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        } disabled:opacity-60`}
      >
        {pending === "premium" ? "..." : isPremium ? "Premium" : "Free"}
      </button>
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => patch({ isActive: !isActive }, "active")}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          isActive
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        } disabled:opacity-60`}
      >
        {pending === "active" ? "..." : isActive ? "Aktif" : "Kapalı"}
      </button>
    </div>
  );
}
