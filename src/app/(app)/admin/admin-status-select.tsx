"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ALL_STATUSES = [
  "draft",
  "info_missing",
  "studio_pending",
  "in_design",
  "preview_ready",
  "customer_revision",
  "approved",
  "payment_pending",
  "paid",
  "published",
  "paused",
  "expired",
  "cancelled",
] as const;

export function AdminStatusSelect({
  projectId,
  currentStatus,
  statusLabels,
  statusColors,
}: {
  projectId: number;
  currentStatus: string;
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setSaving(true);
    const res = await fetch(`/api/admin/projects/${projectId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
          statusColors[status] ?? "bg-gray-100 text-gray-600"
        }`}
      >
        {statusLabels[status] ?? status}
      </span>
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-600 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-black"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabels[s] ?? s}
          </option>
        ))}
      </select>
    </div>
  );
}
