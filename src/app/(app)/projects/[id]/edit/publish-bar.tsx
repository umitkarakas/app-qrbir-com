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
      className="lum-glass"
      style={{
        padding: "14px 20px",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        ...(isPublished
          ? { borderColor: "rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.06)" }
          : {}),
      }}
    >
      {/* Sol: durum + URL */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isPublished ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#15803d", background: "rgba(34,197,94,0.12)", padding: "2px 8px", borderRadius: 20 }}>
                <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
                Yayında
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#15803d", fontFamily: "var(--font-geist-mono, monospace)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {publicUrl}
              </a>
              <button
                onClick={copyUrl}
                style={{ fontSize: 12, fontWeight: 600, color: "#15803d", background: "none", border: 0, cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}
              >
                {copied ? "✓ Kopyalandı" : "Kopyala"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "var(--color-fg-3)", background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: 20 }}>
              <span style={{ width: 6, height: 6, background: "var(--color-fg-4)", borderRadius: "50%", display: "inline-block" }} />
              Yayında Değil
            </span>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-fg-4)" }}>
              Yayınlandığında{" "}
              <span style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-fg-3)" }}>{publicUrl}</span>{" "}
              adresinde erişilebilir olacak.
            </p>
          </div>
        )}
        {error && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-danger)" }}>{error}</p>}
      </div>

      {/* Sağ: buton */}
      <button
        onClick={toggle}
        disabled={loading}
        className={isPublished ? undefined : "lum-cta"}
        style={isPublished ? {
          flexShrink: 0,
          fontSize: 13,
          fontWeight: 600,
          padding: "8px 16px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.65)",
          background: "rgba(255,255,255,0.55)",
          color: "var(--color-fg-2)",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
          fontFamily: "inherit",
        } : {
          flexShrink: 0,
          height: 38,
          padding: "0 16px",
          fontSize: 13,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "…" : isPublished ? "Yayından Kaldır" : "🚀 Yayınla"}
      </button>
    </div>
  );
}
