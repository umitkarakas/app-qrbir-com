"use client";

import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Loader2, Save } from "lucide-react";
import { useState } from "react";
import type { TemplateContract } from "@/features/block-editor/lib/template-contract";
import type { BlockEditorContent } from "@/features/block-editor/types/content";
import { useContractForm } from "./use-contract-form";
import { BlockSection } from "./BlockSection";

export type ContractFormProject = {
  id: number;
  title: string;
  slug: string;
  subdomainType: string;
  status: string;
};

type Props = {
  project: ContractFormProject;
  contract: TemplateContract;
  initialContent: BlockEditorContent;
};

export function ContractForm({ project, contract, initialContent }: Props) {
  const { state, updateValue, addItem, removeItem, isDirty, isSaving, error, save } = useContractForm({
    projectId: project.id,
    contract,
    initialContent,
  });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  async function handleSave() {
    try {
      await save();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch {
      // hata zaten useContractForm error state'inde
    }
  }

  const publicUrl = `https://${project.subdomainType}.qrbir.com/${project.slug}`;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link
              href="/dashboard"
              className="p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex-shrink-0"
              aria-label="Panele dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-slate-900 text-sm truncate">{project.title}</h1>
              <span className="text-xs text-slate-400 truncate block">
                {project.subdomainType}.qrbir.com/{project.slug}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {project.status === "published" && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Yayında
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                showSaveSuccess
                  ? "bg-emerald-100 text-emerald-700"
                  : isDirty
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : showSaveSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{showSaveSuccess ? "Kaydedildi" : "Kaydet"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4 pb-24">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {state.entries.map((entry) => {
          const contractEntry = contract.userEditable.blocks.find((b) => b.id === entry.entryId);
          if (!contractEntry) return null;
          return (
            <BlockSection
              key={entry.entryId}
              contract={contractEntry}
              entry={entry}
              onUpdate={(itemIdx, fieldKey, value) =>
                updateValue(entry.entryId, itemIdx, fieldKey, value)
              }
              onAdd={() => addItem(entry.entryId)}
              onRemove={(itemIdx) => removeItem(entry.entryId, itemIdx)}
            />
          );
        })}

        {state.entries.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">
              Bu şablonda düzenlenebilir alan tanımlı değil.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
