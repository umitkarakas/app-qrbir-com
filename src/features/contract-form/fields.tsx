"use client";

import ImageUpload from "@/features/block-editor/components/ui/ImageUpload";
import type { TemplateEditableField } from "@/features/block-editor/lib/template-contract";
import { X } from "lucide-react";

type FieldProps = {
  field: TemplateEditableField;
  value: unknown;
  onChange: (value: unknown) => void;
};

export function FieldRenderer(props: FieldProps) {
  const { field } = props;
  switch (field.type) {
    case "text":
    case "url":
      return <TextField {...props} />;
    case "textarea":
      return <TextareaField {...props} />;
    case "number":
      return <NumberField {...props} />;
    case "image":
      return <ImageField {...props} />;
    case "boolean":
      return <BooleanField {...props} />;
    case "select":
      return <SelectField {...props} />;
    case "list":
      return <ListField {...props} />;
    default:
      return null;
  }
}

function FieldShell({ field, children }: { field: TemplateEditableField; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {field.helperText && <p className="text-xs text-slate-500">{field.helperText}</p>}
    </div>
  );
}

function TextField({ field, value, onChange }: FieldProps) {
  return (
    <FieldShell field={field}>
      <input
        type={field.type === "url" ? "url" : "text"}
        required={field.required}
        placeholder={field.placeholder}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />
    </FieldShell>
  );
}

function TextareaField({ field, value, onChange }: FieldProps) {
  return (
    <FieldShell field={field}>
      <textarea
        required={field.required}
        placeholder={field.placeholder}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 resize-y"
      />
    </FieldShell>
  );
}

function NumberField({ field, value, onChange }: FieldProps) {
  return (
    <FieldShell field={field}>
      <input
        type="number"
        required={field.required}
        placeholder={field.placeholder}
        value={typeof value === "number" ? value : typeof value === "string" ? value : ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? "" : Number(v));
        }}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />
    </FieldShell>
  );
}

function ImageField({ field, value, onChange }: FieldProps) {
  return (
    <FieldShell field={field}>
      <ImageUpload
        value={typeof value === "string" ? value : undefined}
        onChange={onChange}
        folder="contract-form"
        aspectRatio="square"
      />
    </FieldShell>
  );
}

function BooleanField({ field, value, onChange }: FieldProps) {
  const checked = value === true;
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div>
        <span className="text-sm font-medium text-slate-700">{field.label}</span>
        {field.helperText && <p className="text-xs text-slate-500">{field.helperText}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-slate-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SelectField({ field, value, onChange }: FieldProps) {
  return (
    <FieldShell field={field}>
      <select
        required={field.required}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      >
        {!field.required && <option value="">— Seçim yok —</option>}
        {(field.options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function ListField({ field, value, onChange }: FieldProps) {
  const items: string[] = Array.isArray(value) ? value.map((v) => String(v)) : [];
  return (
    <FieldShell field={field}>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[idx] = e.target.value;
                onChange(next);
              }}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Sil"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          + Yeni öğe
        </button>
      </div>
    </FieldShell>
  );
}
