"use client";

import { useState } from "react";

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    e.preventDefault(); // Link'in tıklanmasını engelle
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard kullanılamıyorsa sessiz kal
    }
  }

  return (
    <button
      onClick={copy}
      title="URL kopyala"
      style={{
        display: "grid",
        placeItems: "center",
        width: 34,
        height: 34,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.65)",
        background: copied ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.55)",
        color: copied ? "var(--color-success)" : "var(--color-fg-2)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 200ms",
        fontFamily: "inherit",
      }}
    >
      {copied ? "✓" : "🔗"}
    </button>
  );
}
