"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TemplateSummary = {
  id: number;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  isPremium: boolean;
};

type Props = {
  projectType: string;
  title: string;
  templates: TemplateSummary[];
};

export function TemplatePickerClient({ projectType, title, templates }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(templateId: number | null) {
    setError("");
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectType, title, templateId }),
    });
    if (!res.ok) {
      setLoading(false);
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Proje oluşturulamadı.");
      return;
    }
    const project = await res.json();
    router.push(`/projects/${project.id}/edit`);
  }

  if (templates.length === 0) {
    return (
      <div className="lum-glass" style={{ padding: 28, maxWidth: 520, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "var(--color-fg-1)" }}>
          Bu tip için şablon yok
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--color-fg-3)" }}>
          Boş bir proje oluşturup içeriği elle düzenleyebilirsiniz.
        </p>
        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "var(--color-danger-bg)",
              border: "1px solid rgba(239,68,68,0.2)",
              fontSize: 13,
              color: "var(--color-danger)",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}
        <button
          onClick={() => handleCreate(null)}
          disabled={loading}
          className="lum-cta"
          style={{ justifyContent: "center", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Oluşturuluyor…" : "Boş proje ile devam et"}
        </button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            background: "var(--color-danger-bg)",
            border: "1px solid rgba(239,68,68,0.2)",
            fontSize: 13,
            color: "var(--color-danger)",
          }}
        >
          {error}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {templates.map((template) => {
          const isSelected = selectedId === template.id;
          return (
            <button
              key={template.id}
              onClick={() => setSelectedId(template.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 10,
                padding: 0,
                borderRadius: 20,
                border: isSelected
                  ? "1.5px solid rgba(124,109,255,0.45)"
                  : "1px solid rgba(255,255,255,0.55)",
                background: isSelected
                  ? "rgba(124,109,255,0.08)"
                  : "rgba(255,255,255,0.36)",
                boxShadow: isSelected
                  ? "inset 0 1px 0 rgba(255,255,255,0.68), 0 0 0 3px rgba(124,109,255,0.08)"
                  : "inset 0 1px 0 rgba(255,255,255,0.68)",
                cursor: "pointer",
                textAlign: "left",
                overflow: "hidden",
                fontFamily: "inherit",
                transition: "all var(--duration-base)",
              }}
            >
              <div
                style={{
                  aspectRatio: "16/10",
                  background: template.thumbnailUrl
                    ? `url(${template.thumbnailUrl}) center/cover`
                    : "linear-gradient(135deg, rgba(124,109,255,0.18), rgba(255,255,255,0.4))",
                  borderBottom: "1px solid rgba(255,255,255,0.55)",
                }}
              />
              <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-fg-1)" }}>
                    {template.name}
                  </p>
                  {template.isPremium && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 6,
                        background: "rgba(245,158,11,0.15)",
                        color: "rgb(180,83,9)",
                      }}
                    >
                      PRO
                    </span>
                  )}
                </div>
                {template.description && (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-fg-3)", lineHeight: 1.4 }}>
                    {template.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedId !== null && (
        <div className="lum-glass" style={{ padding: 20, maxWidth: 520 }}>
          <button
            onClick={() => handleCreate(selectedId)}
            disabled={loading}
            className="lum-cta"
            style={{ justifyContent: "center", width: "100%", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Oluşturuluyor…" : "Bu şablonla projeyi oluştur →"}
          </button>
        </div>
      )}
    </>
  );
}
