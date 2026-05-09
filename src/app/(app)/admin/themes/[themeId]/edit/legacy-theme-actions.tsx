"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface Props {
  themeId: number;
  productType: string;
  availableTemplates: { id: string; name: string }[];
}

export function LegacyThemeActions({ themeId, productType, availableTemplates }: Props) {
  const router = useRouter();
  const [linking, setLinking] = useState(false);
  const [selected, setSelected] = useState(availableTemplates[0]?.id ?? "");

  const hasTemplates = availableTemplates.length > 0;

  async function handleLink() {
    if (!selected) return;
    setLinking(true);
    try {
      const res = await fetch(`/api/admin/themes/${themeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeConfigJson: { templateId: selected, templateVersion: 1 },
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLinking(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {hasTemplates ? (
        <>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg-1)", margin: 0 }}>
            Şablona Bağla
          </p>
          <p style={{ fontSize: 12, color: "var(--color-fg-3)", margin: 0, lineHeight: 1.5 }}>
            Mevcut renklerin yerine seçilen şablonun varsayılan değerleri kullanılır.
            Kaydettikten sonra editörde özelleştirebilirsiniz.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{
                flex: 1,
                height: 38,
                padding: "0 12px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.7)",
                fontSize: 13,
                color: "var(--color-fg-1)",
                fontFamily: "inherit",
              }}
            >
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              onClick={handleLink}
              disabled={linking || !selected}
              style={{
                height: 38,
                padding: "0 18px",
                borderRadius: 10,
                border: "none",
                background: "var(--gradient-violet)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: linking ? "wait" : "pointer",
                fontFamily: "inherit",
                opacity: linking ? 0.7 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {linking ? "Bağlanıyor…" : "Şablona Bağla"}
            </button>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 13, color: "var(--color-fg-3)", margin: 0 }}>
          <strong>{productType}</strong> ürün tipi için henüz kayıtlı şablon yok.
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.06)" }} />
        <span style={{ fontSize: 11, color: "var(--color-fg-4)" }}>veya</span>
        <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.06)" }} />
      </div>

      <Link
        href="/admin/themes/new"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 38,
          borderRadius: 10,
          border: "1px solid rgba(124,109,255,0.3)",
          background: "rgba(124,109,255,0.06)",
          color: "var(--color-accent-violet-deep)",
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
          transition: "background 0.15s",
        }}
      >
        + Yeni Tema Oluştur
      </Link>
    </div>
  );
}
