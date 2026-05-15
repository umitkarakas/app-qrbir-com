"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Palette,
  Plus,
  Save,
  Settings,
} from "lucide-react";
import { useCallback, useState } from "react";
import { EditorProvider, useEditor } from "@/features/block-editor/contexts/EditorContext";
import AddBlockSheet from "@/features/block-editor/components/editor/AddBlockSheet";
import EditBlockSheet from "@/features/block-editor/components/editor/EditBlockSheet";
import EditorCanvas from "@/features/block-editor/components/editor/EditorCanvas";
import Modal from "@/features/block-editor/components/ui/Modal";
import Input from "@/features/block-editor/components/ui/Input";
import Textarea from "@/features/block-editor/components/ui/Textarea";
import { buildBlockEditorContent } from "@/features/block-editor/types/content";
import type { Block, Site, Theme } from "@/features/block-editor/types/database";
import type { ThemeConfig } from "@/types/theme";

type ThemeEditorMeta = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  productType: string;
  isFree: boolean;
  isPremium: boolean;
  previewImageUrl: string | null;
  templateId?: string;
  templateVersion?: number;
};

type Props = {
  theme: ThemeEditorMeta;
  site: Site;
  blocks: Block[];
  themes: Theme[];
  baseConfig: ThemeConfig;
  availableTemplates: { id: string; name: string; version: number }[];
};

type SettingsData = {
  name: string;
  description: string;
  previewImageUrl: string;
  isFree: boolean;
  isPremium: boolean;
  templateId: string;
};

export function ThemeEditorClient({ theme, site, blocks, themes, baseConfig, availableTemplates }: Props) {
  const handleSaveContent = useCallback(
    async (nextSite: Site, nextBlocks: Block[]) => {
      const content = buildBlockEditorContent(nextSite, nextBlocks);
      const res = await fetch(`/api/admin/themes/${theme.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeConfigJson: {
            ...baseConfig,
            templateId: theme.templateId,
            templateVersion: theme.templateVersion ?? 1,
            editorContent: content,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Tema kaydedilemedi");
      }
    },
    [baseConfig, theme.id, theme.templateId, theme.templateVersion]
  );

  return (
    <EditorProvider
      projectId={theme.id}
      initialSite={site}
      initialBlocks={blocks}
      themes={themes}
      onSaveContent={handleSaveContent}
    >
      <ThemeEditorShell
        theme={theme}
        baseConfig={baseConfig}
        availableTemplates={availableTemplates}
      />
    </EditorProvider>
  );
}

function ThemeEditorShell({
  theme,
  baseConfig,
  availableTemplates,
}: {
  theme: ThemeEditorMeta;
  baseConfig: ThemeConfig;
  availableTemplates: { id: string; name: string; version: number }[];
}) {
  const { site, blocks, isDirty, isSaving, save } = useEditor();
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [settingsData, setSettingsData] = useState<SettingsData>({
    name: theme.name,
    description: theme.description ?? "",
    previewImageUrl: theme.previewImageUrl ?? "",
    isFree: theme.isFree,
    isPremium: theme.isPremium,
    templateId: theme.templateId ?? "",
  });

  async function handleSave() {
    setError(null);
    try {
      await save();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Kaydetme başarısız");
    }
  }

  async function handleToggleStatus() {
    setTogglingStatus(true);
    setError(null);
    try {
      const nextStatus = currentTheme.status === "active" ? "draft" : "active";
      const res = await fetch(`/api/admin/themes/${currentTheme.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Tema durumu güncellenemedi");
      setCurrentTheme((prev) => ({ ...prev, status: nextStatus }));
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Tema durumu güncellenemedi");
    } finally {
      setTogglingStatus(false);
    }
  }

  async function handleSaveSettings() {
    if (!site) return;
    setSavingMeta(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/themes/${currentTheme.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settingsData.name,
          description: settingsData.description,
          previewImageUrl: settingsData.previewImageUrl || null,
          isFree: settingsData.isFree,
          isPremium: settingsData.isPremium,
          themeConfigJson: {
            ...baseConfig,
            templateId: settingsData.templateId || undefined,
            templateVersion:
              availableTemplates.find((item) => item.id === settingsData.templateId)?.version ??
              currentTheme.templateVersion ??
              1,
            editorContent: buildBlockEditorContent(site, blocks),
          },
        }),
      });
      if (!res.ok) throw new Error("Tema ayarları kaydedilemedi");
      setCurrentTheme((prev) => ({
        ...prev,
        name: settingsData.name,
        description: settingsData.description,
        previewImageUrl: settingsData.previewImageUrl || null,
        isFree: settingsData.isFree,
        isPremium: settingsData.isPremium,
      }));
      setSettingsOpen(false);
    } catch (settingsError) {
      setError(settingsError instanceof Error ? settingsError.message : "Tema ayarları kaydedilemedi");
    } finally {
      setSavingMeta(false);
    }
  }

  if (!site) return null;

  const isActive = currentTheme.status === "active";
  const previewUrl = `/admin/themes/${currentTheme.id}/preview`;

  return (
    <div className="fixed inset-0 z-30 bg-slate-100">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-800 bg-slate-950 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              href="/admin/themes"
              className="-ml-1 flex-shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
              title="Temalara dön"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-white">{currentTheme.name}</h1>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                  Tasarım Editörü
                </span>
                {isDirty && <span className="hidden text-xs font-medium text-amber-300 sm:inline">Kaydedilmedi</span>}
              </div>
              <span className="block truncate text-xs text-slate-500">
                {currentTheme.productType} · {blocks.length} blok
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            {error && (
              <span className="hidden max-w-[260px] truncate text-xs font-medium text-red-300 md:block">
                {error}
              </span>
            )}
            <Link
              href={previewUrl}
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white sm:flex"
            >
              <ExternalLink className="h-4 w-4" />
              Önizle
            </Link>
            <button
              onClick={handleToggleStatus}
              disabled={togglingStatus}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
              style={{
                backgroundColor: isActive ? "rgba(34, 197, 94, 0.18)" : "rgba(239, 68, 68, 0.18)",
                color: isActive ? "rgb(74 222 128)" : "rgb(248 113 113)",
              }}
            >
              {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{isActive ? "Aktif" : "Pasif"}</span>
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
              title="Tasarım ayarları"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="h-full overflow-y-auto pb-[120px] pt-[60px]">
        <EditorCanvas />
      </main>

      <footer className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2">
        <div className="pointer-events-auto relative mx-auto flex max-w-lg items-end justify-center">
          <div className="flex items-center gap-16 rounded-[28px] border border-slate-100 bg-white px-6 py-3 shadow-lg shadow-slate-900/10 sm:gap-20">
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex flex-col items-center gap-1 px-3 text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-50"
            >
              <Palette className="h-6 w-6" />
              <span className="text-[10px] font-medium">Şablon</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`flex flex-col items-center gap-1 px-3 transition-colors ${
                showSaveSuccess ? "text-emerald-500" : isDirty ? "text-slate-700" : "text-slate-400"
              }`}
            >
              {isSaving ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : showSaveSuccess ? (
                <Check className="h-6 w-6" />
              ) : (
                <Save className="h-6 w-6" />
              )}
              <span className="text-[10px] font-medium">{showSaveSuccess ? "Tamam" : "Kaydet"}</span>
              {isDirty && !showSaveSuccess && (
                <span className="absolute top-2 right-[calc(50%-70px)] h-2 w-2 rounded-full bg-emerald-500 sm:right-[calc(50%-82px)]" />
              )}
            </button>
          </div>

          <button
            onClick={() => setAddSheetOpen(true)}
            className="absolute left-1/2 top-[-20px] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-amber-500 text-white shadow-xl shadow-amber-500/30 transition-all hover:scale-105 hover:bg-amber-600 active:scale-95"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>
      </footer>

      <AddBlockSheet isOpen={addSheetOpen} onClose={() => setAddSheetOpen(false)} />
      <EditBlockSheet />

      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Tasarım Ayarları"
        size="md"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Şablon</span>
            <select
              value={settingsData.templateId}
              onChange={(e) => setSettingsData({ ...settingsData, templateId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">Şablon seçilmedi</option>
              {availableTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Tasarım Adı"
            value={settingsData.name}
            onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
            placeholder="Tasarım adı"
          />
          <Textarea
            label="Açıklama"
            value={settingsData.description}
            onChange={(e) => setSettingsData({ ...settingsData, description: e.target.value })}
            placeholder="Tasarım açıklaması"
            rows={3}
          />
          <Input
            label="Önizleme Görseli URL"
            value={settingsData.previewImageUrl}
            onChange={(e) => setSettingsData({ ...settingsData, previewImageUrl: e.target.value })}
            placeholder="https://..."
          />
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={settingsData.isFree}
              onChange={(e) => setSettingsData({ ...settingsData, isFree: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-slate-700">Ücretsiz tasarım</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={settingsData.isPremium}
              onChange={(e) => setSettingsData({ ...settingsData, isPremium: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-slate-700">Premium tasarım</span>
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setSettingsOpen(false)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            İptal
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={!settingsData.name || savingMeta}
            className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingMeta ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
