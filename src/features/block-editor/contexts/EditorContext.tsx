"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Block, Site, Theme } from "../types/database";
import type { BlockType } from "../types/blocks";
import { getBlockDefaultContent } from "../config/blockRegistry";
import { buildBlockEditorContent } from "../types/content";

type EditorContextType = {
  site: Site | null;
  blocks: Block[];
  selectedBlockId: string | null;
  editingBlockId: string | null;
  previewMode: "mobile" | "desktop";
  isDirty: boolean;
  isSaving: boolean;
  loading: boolean;
  mode: "project" | "template" | "design-preview" | "guest";
  canPublish: boolean;
  canUploadToCloud: boolean;
  themes: Theme[];
  selectedTheme: Theme | null;
  loadSite: () => Promise<void>;
  selectBlock: (id: string | null) => void;
  editBlock: (id: string | null) => void;
  addBlock: (type: BlockType, position?: number) => void;
  updateBlock: (
    id: string,
    updates: Partial<{ content: Record<string, unknown>; settings: Record<string, unknown> }>
  ) => void;
  deleteBlock: (id: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
  duplicateBlock: (id: string) => void;
  updateSite: (updates: Partial<Site>) => void;
  setPreviewMode: (mode: "mobile" | "desktop") => void;
  selectTheme: (themeId: string | null) => void;
  save: () => Promise<void>;
  publish: () => Promise<void>;
  unpublish: () => Promise<void>;
  uploadImage: (file: File) => Promise<{ url: string; isLocal: boolean } | null>;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

type EditorProviderProps = {
  projectId: number;
  initialSite: Site;
  initialBlocks: Block[];
  themes?: Theme[];
  mode?: EditorContextType["mode"];
  onSaveContent?: (site: Site, blocks: Block[]) => Promise<void>;
  children: React.ReactNode;
};

export function EditorProvider({
  projectId,
  initialSite,
  initialBlocks,
  themes = [],
  mode = "project",
  onSaveContent,
  children,
}: EditorProviderProps) {
  const [site, setSite] = useState<Site | null>(initialSite);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  const loadSite = useCallback(async () => undefined, []);
  const selectBlock = useCallback((id: string | null) => {
    setSelectedBlockId(id);
    setEditingBlockId(id);
  }, []);
  const editBlock = useCallback((id: string | null) => setEditingBlockId(id), []);

  const addBlock = useCallback(
    (type: BlockType, position?: number) => {
      const defaultContent = getBlockDefaultContent(type);
      const newPosition = position ?? blocks.length;
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const newBlock: Block = {
        id,
        site_id: String(projectId),
        block_type: type,
        position: newPosition,
        content: defaultContent,
        settings: { isVisible: true, padding: "md", margin: "md" },
        created_at: now,
        updated_at: now,
      };

      setBlocks((prev) => {
        const shifted = prev.map((block) =>
          block.position >= newPosition ? { ...block, position: block.position + 1 } : block
        );
        return [...shifted, newBlock].sort((a, b) => a.position - b.position);
      });
      setSelectedBlockId(id);
      setEditingBlockId(id);
      setIsDirty(true);
    },
    [blocks.length, projectId]
  );

  const updateBlock = useCallback<EditorContextType["updateBlock"]>((id, updates) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? {
              ...block,
              content: updates.content
                ? { ...(block.content as Record<string, unknown>), ...updates.content }
                : block.content,
              settings: updates.settings
                ? { ...(block.settings as Record<string, unknown>), ...updates.settings }
                : block.settings,
              updated_at: new Date().toISOString(),
            }
          : block
      )
    );
    setIsDirty(true);
  }, []);

  const deleteBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => {
        const deleted = prev.find((block) => block.id === id);
        if (!deleted || deleted.block_type === "profile_card") return prev;
        return prev
          .filter((block) => block.id !== id)
          .map((block) =>
            block.position > deleted.position ? { ...block, position: block.position - 1 } : block
          );
      });
      if (selectedBlockId === id) setSelectedBlockId(null);
      if (editingBlockId === id) setEditingBlockId(null);
      setIsDirty(true);
    },
    [editingBlockId, selectedBlockId]
  );

  const reorderBlocks = useCallback((startIndex: number, endIndex: number) => {
    setBlocks((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((block, index) => ({ ...block, position: index }));
    });
    setIsDirty(true);
  }, []);

  const moveBlockUp = useCallback(
    (id: string) => {
      const index = blocks.findIndex((block) => block.id === id);
      if (index > 0) reorderBlocks(index, index - 1);
    },
    [blocks, reorderBlocks]
  );

  const moveBlockDown = useCallback(
    (id: string) => {
      const index = blocks.findIndex((block) => block.id === id);
      if (index >= 0 && index < blocks.length - 1) reorderBlocks(index, index + 1);
    },
    [blocks, reorderBlocks]
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const block = blocks.find((item) => item.id === id);
      if (!block || block.block_type === "profile_card") return;
      const copy: Block = {
        ...block,
        id: crypto.randomUUID(),
        position: block.position + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setBlocks((prev) => {
        const shifted = prev.map((item) =>
          item.position > block.position ? { ...item, position: item.position + 1 } : item
        );
        return [...shifted, copy].sort((a, b) => a.position - b.position);
      });
      setSelectedBlockId(copy.id);
      setEditingBlockId(copy.id);
      setIsDirty(true);
    },
    [blocks]
  );

  const updateSite = useCallback((updates: Partial<Site>) => {
    setSite((prev) => (prev ? { ...prev, ...updates } : null));
    setIsDirty(true);
  }, []);

  const selectTheme = useCallback(
    (themeId: string | null) => {
      const theme = themes.find((item) => item.id === themeId) ?? null;
      setSelectedTheme(theme);
      updateSite({ theme_id: themeId, theme: theme?.config ?? {} });
    },
    [themes, updateSite]
  );

  const save = useCallback(async () => {
    if (!site || isSaving) return;
    setIsSaving(true);
    try {
      if (onSaveContent) {
        await onSaveContent(site, blocks);
      } else {
        const res = await fetch(`/api/projects/${projectId}/content`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: buildBlockEditorContent(site, blocks) }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Kaydetme başarısız");
        }
      }
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [blocks, isSaving, onSaveContent, projectId, site]);

  const publish = useCallback(async () => save(), [save]);
  const unpublish = useCallback(async () => undefined, []);

  const uploadImage = useCallback(async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) return null;
    return { url: data.url as string, isLocal: true };
  }, []);

  const value = useMemo<EditorContextType>(
    () => ({
      site,
      blocks,
      selectedBlockId,
      editingBlockId,
      previewMode,
      isDirty,
      isSaving,
      loading: false,
      mode,
      canPublish: true,
      canUploadToCloud: true,
      themes,
      selectedTheme,
      loadSite,
      selectBlock,
      editBlock,
      addBlock,
      updateBlock,
      deleteBlock,
      reorderBlocks,
      moveBlockUp,
      moveBlockDown,
      duplicateBlock,
      updateSite,
      setPreviewMode,
      selectTheme,
      save,
      publish,
      unpublish,
      uploadImage,
    }),
    [
      site,
      blocks,
      selectedBlockId,
      editingBlockId,
      previewMode,
      isDirty,
      isSaving,
      mode,
      themes,
      selectedTheme,
      loadSite,
      selectBlock,
      editBlock,
      addBlock,
      updateBlock,
      deleteBlock,
      reorderBlocks,
      moveBlockUp,
      moveBlockDown,
      duplicateBlock,
      updateSite,
      selectTheme,
      save,
      publish,
      unpublish,
      uploadImage,
    ]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
