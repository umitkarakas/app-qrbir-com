"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Theme = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  previewImageUrl: string | null;
  isFree: boolean;
  isPremium: boolean;
  themeConfigJson: Record<string, unknown>;
};

export default function ThemePicker({
  projectId,
  currentThemeId,
  themes,
}: {
  projectId: number;
  currentThemeId: number | null;
  themes: Theme[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(currentThemeId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!selected) return;
    setError("");
    setSaving(true);

    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeId: selected }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Tema kaydedilemedi");
      return;
    }

    router.push(`/projects/${projectId}/edit`);
    router.refresh();
  }

  if (themes.length === 0) {
    return (
      <div className="lum-glass" style={{ padding: 40, textAlign: "center", border: "1.5px dashed rgba(124,109,255,0.25)" }}>
        <p style={{ fontSize: 13, color: "var(--color-fg-3)" }}>
          Bu ürün tipi için henüz tema bulunmuyor.
        </p>
      </div>
    );
  }

  const free = themes.filter((t) => !t.isPremium);
  const premium = themes.filter((t) => t.isPremium);

  return (
    <>
      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--color-danger-bg)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "var(--color-danger)" }}>
          {error}
        </div>
      )}

      <Section title="Ücretsiz Temalar" themes={free} selected={selected} setSelected={setSelected} />

      {premium.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Section
            title="Premium Temalar"
            badge="Premium"
            themes={premium}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
      )}

      <div className="lum-glass" style={{ position: "sticky", bottom: 16, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, backdropFilter: "blur(20px)" }}>
        <div style={{ fontSize: 13, color: "var(--color-fg-3)" }}>
          {selected ? (
            <>
              Seçili tema:{" "}
              <span style={{ fontWeight: 600, color: "var(--color-fg-1)" }}>
                {themes.find((t) => t.id === selected)?.name ?? "—"}
              </span>
            </>
          ) : (
            "Henüz tema seçmediniz"
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!selected || saving}
          className="lum-cta"
          style={{ height: 38, padding: "0 20px", fontSize: 13, opacity: (!selected || saving) ? 0.5 : 1 }}
        >
          {saving ? "Kaydediliyor…" : "Bu Temayı Kullan"}
        </button>
      </div>
    </>
  );
}

function Section({
  title,
  badge,
  themes,
  selected,
  setSelected,
}: {
  title: string;
  badge?: string;
  themes: Theme[];
  selected: number | null;
  setSelected: (id: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--color-fg-2)" }}>{title}</h2>
        {badge && (
          <span style={{ fontSize: 11, background: "rgba(245,158,11,0.12)", color: "#92400e", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={selected === theme.id}
            onSelect={() => setSelected(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeCard({
  theme,
  isSelected,
  onSelect,
}: {
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const colors = (theme.themeConfigJson?.colors as Record<string, string>) ?? {};

  return (
    <button
      onClick={onSelect}
      style={{
        textAlign: "left",
        borderRadius: 16,
        padding: 12,
        border: isSelected ? "1.5px solid rgba(124,109,255,0.55)" : "1px solid rgba(255,255,255,0.55)",
        background: isSelected ? "rgba(124,109,255,0.08)" : "rgba(255,255,255,0.36)",
        boxShadow: isSelected
          ? "inset 0 1px 0 rgba(255,255,255,0.68), 0 0 0 3px rgba(124,109,255,0.08)"
          : "inset 0 1px 0 rgba(255,255,255,0.68)",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all var(--duration-base)",
      }}
    >
      {/* Preview */}
      <div
        style={{
          aspectRatio: "4/3",
          borderRadius: 10,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
          background: colors.bg ?? "#f3f4f6",
          color: colors.fg ?? "#111827",
        }}
      >
        <div style={{ textAlign: "center", padding: "0 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: colors.accent ?? colors.fg ?? "#111827" }}>
            {theme.name}
          </div>
          <div style={{ fontSize: 10, opacity: 0.6 }}>Aa Bb Cc</div>
        </div>
      </div>

      {/* Info */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {theme.name}
          </div>
          {theme.description && (
            <div style={{ fontSize: 11, color: "var(--color-fg-3)", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {theme.description}
            </div>
          )}
        </div>
        {theme.isPremium && (
          <span style={{ fontSize: 11, background: "rgba(245,158,11,0.12)", color: "#92400e", padding: "2px 6px", borderRadius: 6, fontWeight: 600, flexShrink: 0 }}>
            ★
          </span>
        )}
      </div>
    </button>
  );
}
