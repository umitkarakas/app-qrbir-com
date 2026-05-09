import type { ThemeTemplate, ProjectType } from "./contract";
import { bioLinkTemplates } from "@/themes/bio-link";

const ALL_TEMPLATES: ThemeTemplate[] = [...bioLinkTemplates];

export function listTemplates(productType?: ProjectType): ThemeTemplate[] {
  if (!productType) return ALL_TEMPLATES;
  return ALL_TEMPLATES.filter((t) => t.productType === productType);
}

export function getTemplate(id: string): ThemeTemplate | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByType(): Record<ProjectType, ThemeTemplate[]> {
  const result = {} as Record<ProjectType, ThemeTemplate[]>;
  for (const t of ALL_TEMPLATES) {
    if (!result[t.productType]) result[t.productType] = [];
    result[t.productType].push(t);
  }
  return result;
}
