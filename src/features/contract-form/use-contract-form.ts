"use client";

import { useCallback, useState } from "react";
import type { TemplateContract } from "@/features/block-editor/lib/template-contract";
import type { BlockEditorContent } from "@/features/block-editor/types/content";
import {
  contentToFormState,
  formStateToContent,
  makeBlankItem,
  type FormState,
} from "./content-adapter";

type UseContractFormArgs = {
  projectId: number;
  contract: TemplateContract;
  initialContent: BlockEditorContent;
};

export function useContractForm({ projectId, contract, initialContent }: UseContractFormArgs) {
  const [state, setState] = useState<FormState>(() => contentToFormState(contract, initialContent));
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateValue = useCallback(
    (entryId: string, itemIdx: number, fieldKey: string, value: unknown) => {
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) => {
          if (entry.entryId !== entryId) return entry;
          return {
            ...entry,
            items: entry.items.map((item, i) =>
              i === itemIdx ? { ...item, values: { ...item.values, [fieldKey]: value } } : item
            ),
          };
        }),
      }));
      setIsDirty(true);
    },
    []
  );

  const addItem = useCallback(
    (entryId: string) => {
      const contractEntry = contract.userEditable.blocks.find((b) => b.id === entryId);
      if (!contractEntry) return;
      const fieldKeys = contractEntry.editableFields.map((f) => f.key);
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) => {
          if (entry.entryId !== entryId) return entry;
          if (contractEntry.maxItems && entry.items.length >= contractEntry.maxItems) return entry;
          return { ...entry, items: [...entry.items, makeBlankItem(entry.blockType, fieldKeys)] };
        }),
      }));
      setIsDirty(true);
    },
    [contract]
  );

  const removeItem = useCallback(
    (entryId: string, itemIdx: number) => {
      const contractEntry = contract.userEditable.blocks.find((b) => b.id === entryId);
      if (!contractEntry) return;
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) => {
          if (entry.entryId !== entryId) return entry;
          const minItems = contractEntry.minItems ?? (contractEntry.required ? 1 : 0);
          if (entry.items.length <= minItems) return entry;
          return { ...entry, items: entry.items.filter((_, i) => i !== itemIdx) };
        }),
      }));
      setIsDirty(true);
    },
    [contract]
  );

  const moveItem = useCallback(
    (entryId: string, fromIdx: number, toIdx: number) => {
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) => {
          if (entry.entryId !== entryId) return entry;
          const items = [...entry.items];
          const [removed] = items.splice(fromIdx, 1);
          items.splice(toIdx, 0, removed);
          return { ...entry, items };
        }),
      }));
      setIsDirty(true);
    },
    []
  );

  const save = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      const content = formStateToContent(state, projectId);
      const res = await fetch(`/api/projects/${projectId}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Kaydetme başarısız");
      }
      setIsDirty(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kaydetme başarısız";
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [state, projectId]);

  return { state, updateValue, addItem, removeItem, moveItem, isDirty, isSaving, error, save };
}
