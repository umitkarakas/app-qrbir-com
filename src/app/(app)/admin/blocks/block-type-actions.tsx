"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface BlockTypeActionsProps {
  id: string;
  isEnabled: boolean;
  isPro: boolean;
}

export function BlockTypeActions({ id, isEnabled, isPro }: BlockTypeActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<"enabled" | "pro" | null>(null);

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

  return (
    <div className="flex items-center justify-end gap-2">
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
  );
}
