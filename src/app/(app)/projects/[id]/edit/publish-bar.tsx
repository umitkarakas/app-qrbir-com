"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUBDOMAIN_DOMAIN: Record<string, string> = {
  m: "m.qrbir.com",
  b: "b.qrbir.com",
  r: "r.qrbir.com",
  e: "e.qrbir.com",
  go: "go.qrbir.com",
};

export function PublishBar({
  projectId,
  initialStatus,
  subdomainType,
  slug,
}: {
  projectId: number;
  initialStatus: string;
  subdomainType: string;
  slug: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const isPublished = status === "published";
  const domain = SUBDOMAIN_DOMAIN[subdomainType] ?? `${subdomainType}.qrbir.com`;
  const publicUrl = `https://${domain}/${slug}`;

  async function toggle() {
    setError("");
    setLoading(true);
    const newStatus = isPublished ? "draft" : "published";

    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "İşlem başarısız");
      return;
    }

    setStatus(newStatus);
    router.refresh();
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API kullanılamıyorsa
    }
  }

  return (
    <div
      className={`rounded-xl border px-5 py-4 mb-6 flex items-center justify-between gap-4 transition-colors ${
        isPublished
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Sol: durum + URL */}
      <div className="flex-1 min-w-0">
        {isPublished ? (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                Yayında
              </span>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-700 font-mono hover:underline truncate"
              >
                {publicUrl}
              </a>
              <button
                onClick={copyUrl}
                className="text-xs text-green-600 hover:text-green-800 shrink-0 font-medium transition-colors"
              >
                {copied ? "✓ Kopyalandı" : "Kopyala"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block" />
              Yayında Değil
            </span>
            <p className="text-xs text-gray-400 mt-1.5">
              Yayınlandığında{" "}
              <span className="font-mono text-gray-500">{publicUrl}</span>{" "}
              adresinde erişilebilir olacak.
            </p>
          </div>
        )}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      {/* Sağ: buton */}
      <button
        onClick={toggle}
        disabled={loading}
        className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-40 transition-colors ${
          isPublished
            ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {loading ? "…" : isPublished ? "Yayından Kaldır" : "🚀 Yayınla"}
      </button>
    </div>
  );
}
