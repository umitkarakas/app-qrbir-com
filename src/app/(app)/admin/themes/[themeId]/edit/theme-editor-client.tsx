"use client";

import { useReducer, useCallback, useState, useEffect } from "react";
import type { EditorSchema, EditorField } from "@/lib/theme-editor/contract";
import type { ThemeConfig } from "@/types/theme";
import { loadTemplateRender, type RenderFn } from "@/lib/theme-editor/client-templates";

// ─── Config Reducer ───────────────────────────────────────────────────────────

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  const result = { ...obj };
  let current: Record<string, unknown> = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] as Record<string, unknown>) };
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

type ConfigAction = { type: "SET"; key: string; value: unknown } | { type: "RESET"; config: ThemeConfig };

function configReducer(state: ThemeConfig, action: ConfigAction): ThemeConfig {
  if (action.type === "RESET") return action.config;
  return setNestedValue(state as Record<string, unknown>, action.key, action.value) as ThemeConfig;
}

// ─── Field Controls ───────────────────────────────────────────────────────────

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

const FONT_OPTIONS = [
  { label: "Sans Serif", value: "sans" },
  { label: "Serif", value: "serif" },
  { label: "Mono", value: "mono" },
  { label: "Rounded", value: "rounded" },
];

const RADIUS_OPTIONS = [
  { label: "Yok", value: "none" },
  { label: "Küçük", value: "sm" },
  { label: "Orta", value: "md" },
  { label: "Büyük", value: "lg" },
  { label: "Tam", value: "full" },
];

function FieldControl({
  field,
  config,
  dispatch,
}: {
  field: EditorField;
  config: ThemeConfig;
  dispatch: React.Dispatch<ConfigAction>;
}) {
  const value = getNestedValue(config, field.key);

  if (field.type === "color") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">{field.label}</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">{String(value ?? "")}</span>
          <input
            type="color"
            value={String(value ?? "#000000")}
            onChange={(e) => dispatch({ type: "SET", key: field.key, value: e.target.value })}
            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
          />
        </div>
      </div>
    );
  }

  if (field.type === "font") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">{field.label}</label>
        <select
          value={String(value ?? "sans")}
          onChange={(e) => dispatch({ type: "SET", key: field.key, value: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          {FONT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "radius") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">{field.label}</label>
        <select
          value={String(value ?? "md")}
          onChange={(e) => dispatch({ type: "SET", key: field.key, value: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          {RADIUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "toggle") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">{field.label}</label>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => dispatch({ type: "SET", key: field.key, value: !value })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            value ? "bg-violet-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              value ? "translate-x-4" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">{field.label}</label>
        <select
          value={String(value ?? "")}
          onChange={(e) => dispatch({ type: "SET", key: field.key, value: e.target.value })}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return null;
}

// ─── Main Editor Component ────────────────────────────────────────────────────

type Props = {
  themeId: number;
  templateId: string;
  templateName: string;
  initialName: string;
  initialStatus: string;
  initialConfig: ThemeConfig;
  defaultConfig: ThemeConfig;
  editorSchema: EditorSchema;
  baseWidth: number;
  demoContent: unknown;
};

export function ThemeEditorClient({
  themeId,
  templateId,
  templateName,
  initialName,
  initialStatus,
  initialConfig,
  defaultConfig,
  editorSchema,
  baseWidth,
  demoContent,
}: Props) {
  const [config, dispatch] = useReducer(configReducer, initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activating, setActivating] = useState(false);
  const [renderFn, setRenderFn] = useState<RenderFn | null>(null);

  useEffect(() => {
    loadTemplateRender(templateId).then((fn) => {
      if (fn) setRenderFn(() => fn);
    });
  }, [templateId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/admin/themes/${themeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeConfigJson: { ...config, templateId, templateVersion: 1 } }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [themeId, config, templateId]);

  const handleActivate = useCallback(async () => {
    setActivating(true);
    try {
      await fetch(`/api/admin/themes/${themeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: initialStatus === "active" ? "draft" : "active",
        }),
      });
      window.location.reload();
    } finally {
      setActivating(false);
    }
  }, [themeId, initialStatus]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET", config: defaultConfig });
  }, [defaultConfig]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <a href="/admin/themes" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Temalar
          </a>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-900">{initialName}</span>
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            initialStatus === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {initialStatus === "active" ? "Aktif" : "Taslak"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
          >
            Sıfırla
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Kaydediliyor…" : saved ? "Kaydedildi ✓" : "Kaydet"}
          </button>
          <button
            onClick={handleActivate}
            disabled={activating}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors disabled:opacity-60 ${
              initialStatus === "active"
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {initialStatus === "active" ? "Pasife Al" : "Aktif Et"}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sol panel — kontroller */}
        <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 space-y-6">
            {editorSchema.sections.map((section) => (
              <div key={section.label}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {section.label}
                </h3>
                <div className="space-y-3">
                  {section.fields.map((field) => (
                    <FieldControl
                      key={field.key}
                      field={field}
                      config={config}
                      dispatch={dispatch}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Sağ panel — preview */}
        <main className="flex-1 overflow-auto flex items-start justify-center py-8 px-4">
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-gray-400 font-medium">
              {baseWidth}px — {templateName}
            </div>
            <div
              style={{
                width: baseWidth,
                minHeight: 667,
                overflow: "hidden",
                borderRadius: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)",
                background: "#fff",
              }}
            >
              {renderFn ? (
                renderFn({ content: demoContent, theme: config, mode: "preview" })
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] text-gray-300 text-sm">
                  Yükleniyor…
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
