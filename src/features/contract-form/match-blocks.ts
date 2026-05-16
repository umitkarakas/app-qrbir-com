import type { TemplateContract, TemplateBlockContract } from "@/features/block-editor/lib/template-contract";
import type { BlockEditorContent } from "@/features/block-editor/types/content";

type Block = BlockEditorContent["blocks"][number];

export type EntryMatch = {
  entry: TemplateBlockContract;
  blocks: Block[];
};

export type MatchResult = {
  matches: EntryMatch[];
  /** Bloklar listesindeki sırayı koruyarak hiçbir entry ile eşleşmeyenler. */
  orphans: Block[];
};

/**
 * Greedy walk: entries sırayla content.blocks'tan tip uyumlu blokları talep eder.
 * Repeatable entry, farklı tipte bir blokla karşılaşana kadar talep eder.
 * Eşleşmeyen blok kalırsa orphans olarak döner (preview için korunur, form'da görünmez).
 */
export function matchBlocks(
  contract: TemplateContract,
  contentBlocks: Block[]
): MatchResult {
  const matches: EntryMatch[] = [];
  const claimed = new Set<string>();
  let cursor = 0;

  for (const entry of contract.userEditable.blocks) {
    const collected: Block[] = [];

    if (entry.repeatable) {
      while (cursor < contentBlocks.length && contentBlocks[cursor].block_type === entry.blockType) {
        collected.push(contentBlocks[cursor]);
        claimed.add(contentBlocks[cursor].id);
        cursor += 1;
      }
    } else if (cursor < contentBlocks.length && contentBlocks[cursor].block_type === entry.blockType) {
      collected.push(contentBlocks[cursor]);
      claimed.add(contentBlocks[cursor].id);
      cursor += 1;
    }

    matches.push({ entry, blocks: collected });
  }

  const orphans = contentBlocks.filter((b) => !claimed.has(b.id));

  return { matches, orphans };
}
