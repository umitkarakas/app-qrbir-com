"use client";

import BlockRenderer from "./blocks/BlockRenderer";
import type { BlockEditorContent } from "../types/content";

type Props = {
  content: BlockEditorContent;
};

export function BlockContentRenderer({ content }: Props) {
  const background =
    typeof content.site.theme === "object" &&
    content.site.theme &&
    "colors" in content.site.theme
      ? ((content.site.theme as { colors?: { background?: string } }).colors?.background ?? "#f8fafc")
      : "#f8fafc";

  return (
    <div className="min-h-screen py-6 px-4" style={{ background }}>
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4">
          {content.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} siteId={block.site_id} />
          ))}
        </div>
      </div>
    </div>
  );
}
