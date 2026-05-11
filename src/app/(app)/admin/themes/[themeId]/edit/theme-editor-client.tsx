"use client";

import { useReducer, useCallback, useState, useEffect, useMemo } from "react";
import { Check, ChevronLeft, Maximize2, MonitorSmartphone, RotateCcw, Save, Smartphone } from "lucide-react";
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
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <div className="min-w-0">
          <label className="block text-sm font-medium text-slate-700">{field.label}</label>
          <span className="block truncate text-xs text-slate-400 font-mono">{String(value ?? "")}</span>
        </div>
        <div className="relative h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <input
            type="color"
            value={String(value ?? "#000000")}
            onChange={(e) => dispatch({ type: "SET", key: field.key, value: e.target.value })}
            className="absolute -inset-1 h-12 w-12 cursor-pointer border-0 p-0"
          />
        </div>
      </div>
    );
  }

  if (field.type === "font") {
    return (
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <label className="text-sm font-medium text-slate-700">{field.label}</label>
        <select
          value={String(value ?? "sans")}
          onChange={(e) => dispatch({ type: "SET", key: field.key, value: e.target.value })}
          className="h-9 min-w-28 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
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
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <label className="text-sm font-medium text-slate-700">{field.label}</label>
        <select
          value={String(value ?? "md")}
          onChange={(e) => dispatch({ type: "SET", key: field.key, value: e.target.value })}
          className="h-9 min-w-24 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
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
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <label className="text-sm font-medium text-slate-700">{field.label}</label>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => dispatch({ type: "SET", key: field.key, value: !value })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value ? "bg-violet-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <label className="text-sm font-medium text-slate-700">{field.label}</label>
        <select
          value={String(value ?? "")}
          onChange={(e) => dispatch({ type: "SET", key: field.key, value: e.target.value })}
          className="h-9 min-w-28 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "range") {
    const numericValue = typeof value === "number" ? value : field.min;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-slate-700">{field.label}</label>
          <span className="text-xs font-mono text-slate-400">{numericValue}</span>
        </div>
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={numericValue}
          onChange={(e) => dispatch({ type: "SET", key: field.key, value: Number(e.target.value) })}
          className="w-full accent-violet-600"
        />
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
  const [dirty, setDirty] = useState(false);
  const [activating, setActivating] = useState(false);
  const [renderFn, setRenderFn] = useState<RenderFn | null>(null);
  const [previewScale, setPreviewScale] = useState<"fit" | "actual">("fit");

  const editorDispatch = useCallback((action: ConfigAction) => {
    setDirty(true);
    dispatch(action);
  }, []);

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
      setDirty(false);
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
    setDirty(true);
  }, [defaultConfig]);

  const previewLabel = useMemo(() => `${baseWidth}px — ${templateName}`, [baseWidth, templateName]);
  const previewWidth = previewScale === "fit" ? Math.min(baseWidth, 390) : baseWidth;
  const previewTransform = previewScale === "fit" && baseWidth > 390 ? previewWidth / baseWidth : 1;

  return (
    <div className="flex flex-col min-h-[calc(100vh-48px)] bg-[#f5f6f9] -m-6">
      <header className="bg-white/95 border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex min-w-0 items-center gap-3">
          <a href="/admin/themes" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm">
            <ChevronLeft className="h-4 w-4" />
            Temalar
          </a>
          <span className="text-slate-300">/</span>
          <span className="truncate text-sm font-semibold text-slate-900">{initialName}</span>
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            initialStatus === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {initialStatus === "active" ? "Aktif" : "Taslak"}
          </span>
          {dirty && (
            <span className="text-xs font-medium text-amber-600">Kaydedilmemiş değişiklik</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-lg border border-slate-200 bg-white p-0.5 md:flex">
            <button
              type="button"
              onClick={() => setPreviewScale("fit")}
              className={`inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium ${
                previewScale === "fit" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <MonitorSmartphone className="h-3.5 w-3.5" />
              Sığdır
            </button>
            <button
              type="button"
              onClick={() => setPreviewScale("actual")}
              className={`inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium ${
                previewScale === "actual" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              1:1
            </button>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
            Sıfırla
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Kaydediliyor…" : saved ? "Kaydedildi" : "Kaydet"}
          </button>
          <button
            onClick={handleActivate}
            disabled={activating}
            className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${
              initialStatus === "active"
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {initialStatus === "active" ? "Pasife Al" : "Aktif Et"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[270px] bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
          <div className="px-4 py-5">
            {editorSchema.sections.map((section) => (
              <section key={section.label} className="border-b border-slate-100 py-5 first:pt-0 last:border-b-0">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {section.label}
                </h3>
                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <FieldControl
                      key={field.key}
                      field={field}
                      config={config}
                      dispatch={editorDispatch}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_52%_86%,rgba(245,158,11,0.12),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(14,165,233,0.12),transparent_26%)]">
          <div className="flex min-h-full flex-col items-center gap-3 px-6 py-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Smartphone className="h-3.5 w-3.5" />
              {previewLabel}
            </div>
            <div
              className="origin-top"
              style={{
                width: previewWidth,
                minHeight: 667 * previewTransform,
              }}
            >
              <div
                style={{
                  width: baseWidth,
                  minHeight: 667,
                  overflow: "hidden",
                  borderRadius: 30,
                  boxShadow: "0 24px 80px rgba(15,23,42,0.24), 0 0 0 1px rgba(15,23,42,0.10)",
                  background: "#fff",
                  transform: `scale(${previewTransform})`,
                  transformOrigin: "top left",
                }}
              >
                {renderFn ? (
                  renderFn({ content: demoContent, theme: config, mode: "preview" })
                ) : (
                  <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-slate-300">
                    Yükleniyor…
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
