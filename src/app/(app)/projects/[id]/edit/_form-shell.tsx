"use client";

import { ReactNode, useState } from "react";

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="lum-glass" style={{ padding: 20, marginBottom: 12 }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--color-fg-1)" }}>{title}</h2>
        {description && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-fg-3)" }}>{description}</p>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="lum-label">{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "var(--color-fg-4)", margin: "4px 0 0" }}>{hint}</p>}
    </div>
  );
}

export const inputCls = "lum-input";

export function SaveBar({
  saving,
  message,
  error,
  onSave,
}: {
  saving: boolean;
  message: string;
  error: string;
  onSave: () => void;
}) {
  return (
    <div className="lum-glass" style={{ position: "sticky", bottom: 16, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, backdropFilter: "blur(20px)" }}>
      <div style={{ fontSize: 13 }}>
        {error ? (
          <span style={{ color: "var(--color-danger)" }}>{error}</span>
        ) : message ? (
          <span style={{ color: "var(--color-success)" }}>{message}</span>
        ) : (
          <span style={{ color: "var(--color-fg-4)" }}>Değişiklikleri kaydetmeyi unutmayın</span>
        )}
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        className="lum-cta"
        style={{ height: 38, padding: "0 20px", fontSize: 13, opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </div>
  );
}

export function useSaver(projectId: number) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(content: unknown) {
    setError("");
    setMessage("");
    setSaving(true);

    const res = await fetch(`/api/projects/${projectId}/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.issues) {
        setError("Doğrulama hatası — alanları kontrol edin");
      } else {
        setError(data.error ?? "Kaydedilemedi");
      }
      return false;
    }

    const data = await res.json().catch(() => ({}));

    // Free plan uyarıları varsa göster
    if (data.warnings?.length) {
      setMessage(`Kaydedildi ✓  ⚠️ ${data.warnings[0]}`);
    } else {
      setMessage("Kaydedildi ✓");
    }
    setTimeout(() => setMessage(""), 5000);
    return true;
  }

  return { saving, error, message, save };
}
