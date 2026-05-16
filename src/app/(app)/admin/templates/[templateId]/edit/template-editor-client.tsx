"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileCode2,
  Loader2,
  Plus,
  Save,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { EditorProvider, useEditor } from "@/features/block-editor/contexts/EditorContext";
import AddBlockSheet from "@/features/block-editor/components/editor/AddBlockSheet";
import EditBlockSheet from "@/features/block-editor/components/editor/EditBlockSheet";
import EditorCanvas from "@/features/block-editor/components/editor/EditorCanvas";
import { buildBlockEditorContent } from "@/features/block-editor/types/content";
import type { Block, Site, Theme } from "@/features/block-editor/types/database";
import { TemplateContractSchema } from "@/features/block-editor/lib/template-contract";

type TemplateEditorMeta = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  productType: string;
  themeId: number | null;
  isActive: boolean;
  isPremium: boolean;
  version: number;
  metadata: Record<string, unknown> | null;
};

type Props = {
  template: TemplateEditorMeta;
  site: Site;
  blocks: Block[];
  themes: Theme[];
};

export function TemplateEditorClient({ template, site, blocks, themes }: Props) {
  const handleSaveContent = useCallback(
    async (nextSite: Site, nextBlocks: Block[]) => {
      const content = buildBlockEditorContent(nextSite, nextBlocks);
      const themeId = nextSite.theme_id ? Number(nextSite.theme_id) : template.themeId;
      const res = await fetch(`/api/admin/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: content.blocks,
          settings: {
            ...(content.site.settings as Record<string, unknown>),
            site: content.site,
          },
          themeId: Number.isFinite(themeId) ? themeId : null,
          version: template.version + 1,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Şablon kaydedilemedi");
      }
    },
    [template.id, template.themeId, template.version]
  );

  return (
    <EditorProvider
      projectId={template.id}
      initialSite={site}
      initialBlocks={blocks}
      themes={themes}
      mode="template"
      onSaveContent={handleSaveContent}
    >
      <TemplateEditorShell template={template} />
    </EditorProvider>
  );
}

function TemplateEditorShell({ template }: { template: TemplateEditorMeta }) {
  const { site, blocks, isDirty, isSaving, save } = useEditor();
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [contractSheetOpen, setContractSheetOpen] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (!site) return null;

  return (
    <div className="fixed inset-0 z-30 bg-slate-100">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-800 bg-slate-950 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              href="/admin/templates"
              className="-ml-1 flex-shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
              title="Şablonlara dön"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-white">{template.name}</h1>
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-300">
                  Şablon Editörü
                </span>
                {isDirty && <span className="hidden text-xs font-medium text-amber-300 sm:inline">Kaydedilmedi</span>}
              </div>
              <span className="block truncate text-xs text-slate-500">
                {template.productType} · {blocks.length} blok · v{template.version}
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            {error && (
              <span className="hidden max-w-[260px] truncate text-xs font-medium text-red-300 md:block">
                {error}
              </span>
            )}
            <button
              onClick={() => setContractSheetOpen(true)}
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white sm:flex"
              title="Contract JSON düzenle"
            >
              <FileCode2 className="h-4 w-4" />
              Contract
            </button>
            <Link
              href="/admin/templates"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white sm:flex"
            >
              <ExternalLink className="h-4 w-4" />
              Liste
            </Link>
          </div>
        </div>
      </header>

      <main className="h-full overflow-y-auto pb-[120px] pt-[60px]">
        <EditorCanvas />
      </main>

      <footer className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2">
        <div className="pointer-events-auto relative mx-auto flex max-w-lg items-end justify-center">
          <div className="flex items-center gap-20 rounded-[28px] border border-slate-100 bg-white px-8 py-3 shadow-lg shadow-slate-900/10">
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
            </button>
          </div>

          <button
            onClick={() => setAddSheetOpen(true)}
            className="absolute left-1/2 top-[-20px] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-sky-600 text-white shadow-xl shadow-sky-600/30 transition-all hover:scale-105 hover:bg-sky-700 active:scale-95"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>
      </footer>

      <AddBlockSheet isOpen={addSheetOpen} onClose={() => setAddSheetOpen(false)} />
      <EditBlockSheet />
      <ContractEditorSheet
        templateId={template.id}
        isOpen={contractSheetOpen}
        onClose={() => setContractSheetOpen(false)}
        initialMetadata={template.metadata}
      />
    </div>
  );
}

const CONTRACT_PLACEHOLDER = JSON.stringify(
  {
    version: 1,
    lockedLayout: true,
    allowBlockReorder: false,
    allowBlockAddRemove: false,
    userEditable: {
      blocks: [
        {
          id: "my-block",
          blockType: "profile_card",
          label: "Başlık",
          required: true,
          repeatable: false,
          editableFields: [
            { key: "name", type: "text", label: "Ad", required: true },
          ],
        },
      ],
    },
  },
  null,
  2
);

function ContractEditorSheet({
  templateId,
  isOpen,
  onClose,
  initialMetadata,
}: {
  templateId: number;
  isOpen: boolean;
  onClose: () => void;
  initialMetadata: Record<string, unknown> | null;
}) {
  const existingContract = initialMetadata?.contract;
  const [json, setJson] = useState(
    existingContract ? JSON.stringify(existingContract, null, 2) : ""
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  function validate(value: string): unknown | null {
    try {
      const parsed = JSON.parse(value);
      const result = TemplateContractSchema.safeParse(parsed);
      if (!result.success) {
        setValidationError(result.error.issues.map((i) => i.message).join(", "));
        return null;
      }
      setValidationError(null);
      return result.data;
    } catch {
      setValidationError("Geçersiz JSON");
      return null;
    }
  }

  async function handleSave() {
    const contract = validate(json);
    if (!contract) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: { contract } }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setValidationError(data?.error ?? "Kaydetme başarısız");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setValidationError("Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Contract JSON</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              TemplateContractSchema ile doğrulanır · Kaydet ile templates.metadata.contract'a yazılır
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <textarea
            value={json}
            onChange={(e) => { setJson(e.target.value); setValidationError(null); }}
            placeholder={CONTRACT_PLACEHOLDER}
            className="h-full min-h-[320px] w-full rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-sky-500"
            spellCheck={false}
          />
          {validationError && (
            <p className="mt-2 text-xs text-red-400">{validationError}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-5 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-900">
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !json.trim()}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              saved ? "bg-emerald-600 text-white" : "bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
            }`}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "Kaydedildi" : "Kaydet"}
          </button>
        </div>
      </div>
    </>
  );
}
