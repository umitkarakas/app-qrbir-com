"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Save,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import { EditorProvider, useEditor } from "@/features/block-editor/contexts/EditorContext";
import AddBlockSheet from "@/features/block-editor/components/editor/AddBlockSheet";
import EditBlockSheet from "@/features/block-editor/components/editor/EditBlockSheet";
import PreviewSheet from "@/features/block-editor/components/editor/PreviewSheet";
import ControlPanelSheet from "@/features/block-editor/components/editor/ControlPanelSheet";
import EditorCanvas from "@/features/block-editor/components/editor/EditorCanvas";
import EditorTour from "@/features/block-editor/components/editor/EditorTour";
import type { Block, Site, Theme } from "@/features/block-editor/types/database";
import type { EditorProject } from "@/features/block-editor/types/content";

type Props = {
  project: EditorProject;
  site: Site;
  blocks: Block[];
  themes: Theme[];
};

export function BlockEditorClient({ project, site, blocks, themes }: Props) {
  return (
    <EditorProvider
      projectId={project.id}
      initialSite={site}
      initialBlocks={blocks}
      themes={themes}
    >
      <EditorShell project={project} />
    </EditorProvider>
  );
}

function EditorShell({ project }: { project: EditorProject }) {
  const router = useRouter();
  const {
    site,
    isDirty,
    isSaving,
    save,
  } = useEditor();
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [controlPanelOpen, setControlPanelOpen] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    setSaveError(null);
    try {
      await save();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Kaydetme başarısız");
    }
  }

  if (!site) return null;

  return (
    <div className="fixed inset-0 z-30 bg-slate-100">
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 px-3 py-2.5 z-40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link
              href="/dashboard"
              className="p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-slate-900 text-sm truncate">{site.title}</h1>
              <span className="text-xs text-slate-400 truncate block">
                {project.subdomainType}.qrbir.com/{project.slug}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {saveError && (
              <span className="hidden sm:block text-xs font-medium text-red-600 max-w-[220px] truncate">
                {saveError}
              </span>
            )}
            <span
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: project.status === "published" ? "rgb(240 253 244)" : "rgb(254 242 242)",
                color: project.status === "published" ? "rgb(22 163 74)" : "rgb(220 38 38)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: project.status === "published" ? "rgb(22 163 74)" : "rgb(220 38 38)",
                }}
              />
              <span>{project.status === "published" ? "Yayında" : "Taslak"}</span>
            </span>

            <button
              onClick={() => setControlPanelOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              title="Kontrol Paneli"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-[60px] pb-[120px] h-full overflow-y-auto">
        <EditorCanvas />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 pointer-events-none">
        <div className="max-w-lg mx-auto relative flex items-end justify-center pointer-events-auto">
          <div className="flex items-center bg-white rounded-[28px] shadow-lg shadow-slate-900/10 border border-slate-100 px-8 py-3">
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`flex flex-col items-center gap-1 transition-colors px-3 ${
                showSaveSuccess
                  ? "text-emerald-500"
                  : isDirty
                    ? "text-slate-700"
                    : "text-slate-400"
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : showSaveSuccess ? (
                <Check className="w-6 h-6" />
              ) : (
                <Save className="w-6 h-6" />
              )}
              <span className="text-[10px] font-medium">
                {showSaveSuccess ? "Tamam" : "Kaydet"}
              </span>
              {isDirty && !showSaveSuccess && (
                <span className="absolute right-[calc(50%-34px)] top-2 h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          <button
            onClick={() => setAddSheetOpen(true)}
            className="absolute left-1/2 -translate-x-1/2 -top-5 w-16 h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </div>
      </footer>

      <AddBlockSheet isOpen={addSheetOpen} onClose={() => setAddSheetOpen(false)} />
      <EditBlockSheet />
      <PreviewSheet isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
      <ControlPanelSheet
        isOpen={controlPanelOpen}
        onClose={() => setControlPanelOpen(false)}
        site={site}
        onNavigateToQR={() => router.push(`/projects/${project.id}/edit`)}
      />
      <EditorTour />
    </div>
  );
}
