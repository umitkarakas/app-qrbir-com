/**
 * registry.ts — Şablon kayıt merkezi (TEK NOKTA)
 *
 * Yeni şablon eklemek için:
 *   1. src/themes/{tip}/templates/YeniSablon.tsx — render fonksiyonu
 *   2. src/themes/{tip}/index.ts — export listesine ekle
 *   3. Burada: import + ALL_TEMPLATES'e ekle
 *
 * Public render otomatik olarak getTemplate(id)?.render kullanır.
 * Admin editör önizlemesi de aynı kodu çalıştırır.
 */
import type { ThemeTemplate, ProjectType } from "./contract";
import { bioLinkTemplates } from "@/themes/bio-link";
import { restaurantMenuTemplates } from "@/themes/restaurant-menu";

const ALL_TEMPLATES: ThemeTemplate[] = [...bioLinkTemplates, ...restaurantMenuTemplates];

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
