import type React from "react";
import type { ThemeConfig } from "@/types/theme";
import type { BlockEditorContent } from "@/features/block-editor/types/content";

export type ProjectType =
  | "restaurant_menu"
  | "bio_link"
  | "brand_bio"
  | "google_review"
  | "event_invitation"
  | "campaign_link";

// ─── Editor Schema ───────────────────────────────────────────────────────────
// Online editörün sol panelinde otomatik olarak üretilecek kontrollerdir.
// Template, render kodunu değil — sadece bu alanları açar.

export type EditorField =
  | { type: "color"; key: string; label: string }
  | { type: "font"; key: string; label: string }
  | { type: "radius"; key: string; label: string }
  | { type: "toggle"; key: string; label: string; section?: "layout" | "capabilities" }
  | {
      type: "select";
      key: string;
      label: string;
      options: { label: string; value: string }[];
    }
  | { type: "range"; key: string; label: string; min: number; max: number; step: number };

export type EditorSection = {
  label: string;
  fields: EditorField[];
};

export type EditorSchema = {
  sections: EditorSection[];
};

// ─── Viewport ────────────────────────────────────────────────────────────────

export type TemplateViewport = {
  baseWidth: number;   // tasarım genişliği — genellikle 390 (iPhone 14)
  minWidth: number;
  maxWidth: number;
  safeArea: "mobile" | "full" | "responsive";
};

// ─── ThemeTemplate ───────────────────────────────────────────────────────────
// Her template'in implement etmesi gereken kontrat.
// Skill dosyası bu tipi referans alarak TypeScript template kodu üretir.

export type ThemeTemplate<
  TContent = unknown,
  TConfig extends ThemeConfig = ThemeConfig,
> = {
  /** "bio-link/minimal-dark" gibi eğik çizgili tam ID */
  id: string;
  /** Kullanıcıya gösterilecek isim */
  name: string;
  productType: ProjectType;
  version: number;
  viewport: TemplateViewport;
  /** Template'in desteklediği özellik listesi — editörde filtre/bilgi için */
  capabilities: string[];
  /** Template yüklendiğinde varsayılan token değerleri */
  defaultConfig: TConfig;
  /** Online editörde sol paneli oluşturan şema */
  editorSchema: EditorSchema;
  render: (props: {
    content: TContent;
    theme: TConfig;
    mode: "preview" | "public";
  }) => React.ReactNode;
};

// ─── themeConfigJson formatı ─────────────────────────────────────────────────
// DB'ye yazılan ve online editörden okunan yapı.
// templateId + templateVersion yoksa legacy ThemeConfig fallback'i devreye girer.

export type StoredThemeConfig = ThemeConfig & {
  templateId?: string;
  templateVersion?: number;
  editorContent?: BlockEditorContent;
};
