"use client";

import BlockRenderer from "./blocks/BlockRenderer";
import type { BlockEditorContent } from "../types/content";
import type { ThemeConfig } from "../types/theme";
import { getThemeVariables } from "../lib/theme";

type Props = {
  content: BlockEditorContent;
};

export function BlockContentRenderer({ content }: Props) {
  // Kaydedilen tema runtime ThemeConfig formatındadır (primary/background/text).
  // getThemeVariables() ile tüm CSS değişkenlerini üretip container'a enjekte ediyoruz.
  const themeConfig =
    typeof content.site.theme === "object" && content.site.theme
      ? (content.site.theme as ThemeConfig)
      : null;

  const cssVars = themeConfig ? getThemeVariables(themeConfig) : {};

  const background = themeConfig?.colors.background ?? "#f8fafc";
  const textColor = themeConfig?.colors.text ?? "#111827";
  const fontFamily = themeConfig?.fonts.body ?? "system-ui, sans-serif";

  return (
    <div
      className="min-h-screen"
      style={{
        ...cssVars,
        background,
        color: textColor,
        fontFamily,
      } as React.CSSProperties}
    >
      <div className="py-6 px-4">
        <div className="mx-auto w-full max-w-md space-y-4">
          {content.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} siteId={block.site_id} />
          ))}
        </div>
      </div>
    </div>
  );
}
