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
      className="text-xs text-green-600 hover:text-green-800 font-medium transition-colors"
    >
      {copied ? "✓" : "Kopyala"}
    </button>
  );
}
