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

    router.push("/dashboard");
    router.refresh();
  }

  if (themes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
        <p className="text-gray-500">
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
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <Section title="Ücretsiz Temalar" themes={free} selected={selected} setSelected={setSelected} />

      {premium.length > 0 && (
        <div className="mt-8">
          <Section
            title="Premium Temalar"
            badge="Premium"
            themes={premium}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
      )}

      <div className="mt-8 sticky bottom-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selected ? (
            <>
              Seçili tema:{" "}
              <span className="font-medium text-gray-900">
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
          className="bg-black text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors"
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
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {badge && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            {badge}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
      className={`
        text-left bg-white rounded-xl border-2 p-3 transition-all
        ${
          isSelected
            ? "border-black shadow-md"
            : "border-gray-200 hover:border-gray-400"
        }
      `}
    >
      {/* Preview */}
      <div
        className="aspect-[4/3] rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-gray-100"
        style={{
          background: colors.bg ?? "#f3f4f6",
          color: colors.fg ?? "#111827",
        }}
      >
        <div className="text-center px-3">
          <div
            className="text-xs font-semibold mb-1"
            style={{ color: colors.accent ?? colors.fg ?? "#111827" }}
          >
            {theme.name}
          </div>
          <div className="text-[10px] opacity-70">Aa Bb Cc</div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 truncate">
            {theme.name}
          </div>
          {theme.description && (
            <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {theme.description}
            </div>
          )}
        </div>
        {theme.isPremium && (
          <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium shrink-0">
            ★
          </span>
        )}
      </div>
    </button>
  );
}
