"use client";

import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { TemplateBlockContract } from "@/features/block-editor/lib/template-contract";
import { FieldRenderer } from "./fields";
import type { FormEntry } from "./content-adapter";

type Constraints = {
  allowBlockReorder: boolean;
  allowBlockAddRemove: boolean;
};

type Props = {
  contract: TemplateBlockContract;
  entry: FormEntry;
  constraints: Constraints;
  onUpdate: (itemIdx: number, fieldKey: string, value: unknown) => void;
  onAdd: () => void;
  onRemove: (itemIdx: number) => void;
  onMoveUp: (itemIdx: number) => void;
  onMoveDown: (itemIdx: number) => void;
};

export function BlockSection({
  contract,
  entry,
  constraints,
  onUpdate,
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const minItems = contract.minItems ?? (contract.required ? 1 : 0);
  const canAdd = constraints.allowBlockAddRemove && (!contract.maxItems || entry.items.length < contract.maxItems);
  const canRemove = constraints.allowBlockAddRemove && entry.items.length > minItems;

  if (!contract.repeatable) {
    const item = entry.items[0];
    if (!item) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">{contract.label}</h3>
          <p className="text-sm text-slate-500">Bu blok için içerik bulunamadı.</p>
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900">{contract.label}</h3>
        <div className="space-y-3">
          {contract.editableFields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={item.values[field.key]}
              onChange={(value) => onUpdate(0, field.key, value)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{contract.label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {entry.items.length} öğe
            {contract.maxItems ? ` · en fazla ${contract.maxItems}` : ""}
            {minItems > 0 ? ` · en az ${minItems}` : ""}
          </p>
        </div>
        {constraints.allowBlockAddRemove && (
          <button
            type="button"
            onClick={onAdd}
            disabled={!canAdd}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni
          </button>
        )}
      </div>

      <div className="space-y-3">
        {entry.items.map((item, itemIdx) => (
          <div key={item.blockId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">#{itemIdx + 1}</span>
              <div className="flex items-center gap-1">
                {/* Sıralama butonları — allowBlockReorder: true olduğunda göster */}
                {constraints.allowBlockReorder && (
                  <>
                    <button
                      type="button"
                      onClick={() => onMoveUp(itemIdx)}
                      disabled={itemIdx === 0}
                      className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Yukarı taşı"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveDown(itemIdx)}
                      disabled={itemIdx === entry.items.length - 1}
                      className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Aşağı taşı"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </>
                )}
                {/* Silme butonu — allowBlockAddRemove: true olduğunda göster */}
                {constraints.allowBlockAddRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(itemIdx)}
                    disabled={!canRemove}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {contract.editableFields.map((field) => (
                <FieldRenderer
                  key={field.key}
                  field={field}
                  value={item.values[field.key]}
                  onChange={(value) => onUpdate(itemIdx, field.key, value)}
                />
              ))}
            </div>
          </div>
        ))}
        {entry.items.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">Henüz öğe yok</p>
          </div>
        )}
      </div>
    </div>
  );
}
