"use client";

import { useState } from "react";

export function TitleEditor({
  projectId,
  initial,
}: {
  projectId: number;
  initial: string;
}) {
  const [title, setTitle] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === title) {
      setDraft(title);
      setEditing(false);
      return;
    }
    setSaving(true);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    setSaving(false);
    setTitle(trimmed);
    setEditing(false);
  }

  function cancel() {
    setDraft(title);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          className="text-2xl font-bold text-gray-900 border-b-2 border-black bg-transparent outline-none min-w-0 w-full max-w-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          autoFocus
          maxLength={120}
        />
        {saving && (
          <span className="text-xs text-gray-400 shrink-0">kaydediliyor…</span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(title);
        setEditing(true);
      }}
      className="group flex items-center gap-1.5 text-left"
    >
      <span className="text-2xl font-bold text-gray-900">{title}</span>
      <span className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        ✎
      </span>
    </button>
  );
}
