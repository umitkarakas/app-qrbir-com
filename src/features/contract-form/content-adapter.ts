import type { TemplateContract } from "@/features/block-editor/lib/template-contract";
import type { BlockEditorContent } from "@/features/block-editor/types/content";
import { matchBlocks } from "./match-blocks";

type Block = BlockEditorContent["blocks"][number];

export type FormItem = {
  blockId: string;
  /** Editable field values keyed by editableField.key. */
  values: Record<string, unknown>;
  /** Editable olmayan alanları korumak için orijinal block.content kopyası. */
  originalContent: Record<string, unknown>;
  /** Block settings (visibility, padding…) — değiştirilmez, korunur. */
  settings: Record<string, unknown>;
  createdAt: string;
};

export type FormEntry = {
  entryId: string;
  blockType: string;
  items: FormItem[];
};

export type FormState = {
  entries: FormEntry[];
  /** Hiçbir entry ile eşleşmeyen bloklar — preview için korunur, formda görünmez. */
  orphanBlocks: Block[];
  site: BlockEditorContent["site"];
};

const DEFAULT_SETTINGS = { isVisible: true, padding: "md", margin: "md" };

/** İlk yüklemede content'ten form state üret. */
export function contentToFormState(
  contract: TemplateContract,
  content: BlockEditorContent
): FormState {
  const { matches, orphans } = matchBlocks(contract, content.blocks);

  const entries: FormEntry[] = matches.map(({ entry, blocks }) => {
    const items: FormItem[] = blocks.map((block) => extractItem(block, entry.editableFields.map((f) => f.key)));

    if (items.length === 0 && entry.required) {
      // required entry ama hiç blok yok — boş bir item oluştur
      items.push(makeBlankItem(entry.blockType, entry.editableFields.map((f) => f.key)));
    }

    return {
      entryId: entry.id,
      blockType: entry.blockType,
      items,
    };
  });

  return {
    entries,
    orphanBlocks: orphans,
    site: content.site,
  };
}

/** Save sırasında form state'i tekrar BlockEditorContent'e çevir. */
export function formStateToContent(
  state: FormState,
  projectId: number | string
): BlockEditorContent {
  const now = new Date().toISOString();
  const siteId = String(projectId);
  const blocks: Block[] = [];

  for (const entry of state.entries) {
    for (const item of entry.items) {
      blocks.push({
        id: item.blockId,
        site_id: siteId,
        block_type: entry.blockType,
        position: blocks.length,
        content: { ...item.originalContent, ...item.values },
        settings: item.settings,
        created_at: item.createdAt,
        updated_at: now,
      });
    }
  }

  for (const orphan of state.orphanBlocks) {
    blocks.push({ ...orphan, position: blocks.length });
  }

  return {
    editor: "qr1-blocks",
    version: 1,
    site: state.site,
    blocks,
  };
}

/** Repeatable entry'ye yeni bir item eklemek için kullanılır. */
export function makeBlankItem(blockType: string, fieldKeys: string[]): FormItem {
  const now = new Date().toISOString();
  const values: Record<string, unknown> = {};
  for (const key of fieldKeys) {
    values[key] = "";
  }
  return {
    blockId: cryptoRandomId(),
    values,
    originalContent: {},
    settings: { ...DEFAULT_SETTINGS },
    createdAt: now,
  };
}

function extractItem(block: Block, fieldKeys: string[]): FormItem {
  const blockContent = (block.content ?? {}) as Record<string, unknown>;
  const values: Record<string, unknown> = {};
  for (const key of fieldKeys) {
    values[key] = blockContent[key] ?? "";
  }
  return {
    blockId: block.id,
    values,
    originalContent: blockContent,
    settings: (block.settings as Record<string, unknown>) ?? { ...DEFAULT_SETTINGS },
    createdAt: block.created_at,
  };
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
