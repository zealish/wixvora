"use client";

import { useCallback, useState } from "react";
import type { BlockConfig, PageSettings } from "../../../lib/block-types";
import { DEFAULT_PAGE_SETTINGS, createBlockId } from "../../../lib/block-types";
import type { BlockCatalogItem } from "../../../lib/block-catalog";
import { createBlockFromCatalog, PRESET_TEMPLATES } from "../../../lib/block-catalog";

export type Viewport = "desktop" | "tablet" | "mobile";
export type EditorTab = "blocks" | "layers" | "templates" | "settings";

export function useBlockEditor(
  initialBlocks: BlockConfig[],
  initialPageSettings?: PageSettings
) {
  const [blocks, setBlocks] = useState<BlockConfig[]>(initialBlocks);
  const [pageSettings, setPageSettingsState] = useState<PageSettings>({
    ...DEFAULT_PAGE_SETTINGS,
    ...initialPageSettings,
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    initialBlocks[0]?.id ?? null
  );
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [activeTab, setActiveTab] = useState<EditorTab>("blocks");
  const [isPreviewMode, setPreviewMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [history, setHistory] = useState<BlockConfig[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const commit = useCallback(
    (next: BlockConfig[]) => {
      setBlocks(next);
      setHistory((h) => [...h.slice(0, historyIndex + 1), next]);
      setHistoryIndex((i) => i + 1);
      setDirty(true);
    },
    [historyIndex]
  );

  const addBlock = useCallback(
    (item: BlockCatalogItem) => {
      const newBlock = createBlockFromCatalog(item);
      commit([...blocks, newBlock]);
      setSelectedBlockId(newBlock.id);
    },
    [blocks, commit]
  );

  const updateBlockProps = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      commit(
        blocks.map((b) =>
          b.id === id
            ? ({ ...b, props: { ...b.props, ...patch } } as BlockConfig)
            : b
        )
      );
    },
    [blocks, commit]
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      const target = blocks[index];
      if (!target) return;

      const copy = {
        id: createBlockId(),
        type: target.type,
        hidden: false,
        props: {
          ...target.props,
          layerName: `${target.props.layerName ?? "Layer"} (Copy)`,
        },
      } as BlockConfig;

      const next = [...blocks];
      next.splice(index + 1, 0, copy);
      commit(next);
      setSelectedBlockId(copy.id);
    },
    [blocks, commit]
  );

  const moveBlock = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= blocks.length) return;

      const next = [...blocks];
      const [moved] = next.splice(index, 1);
      if (!moved) return;
      next.splice(targetIndex, 0, moved);
      commit(next);
    },
    [blocks, commit]
  );

  const toggleBlockVisibility = useCallback(
    (id: string) => {
      commit(
        blocks.map((b) => (b.id === id ? { ...b, hidden: !b.hidden } : b))
      );
    },
    [blocks, commit]
  );

  const deleteBlock = useCallback(
    (id: string) => {
      if (blocks.length <= 1) return;
      const next = blocks.filter((b) => b.id !== id);
      if (next.length === 0) return;
      commit(next);
      if (selectedBlockId === id) {
        setSelectedBlockId(next[0]?.id ?? null);
      }
    },
    [blocks, commit, selectedBlockId]
  );

  const setPageSettings = useCallback((patch: Partial<PageSettings>) => {
    setPageSettingsState((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      if (!prev) return;
      setHistoryIndex(historyIndex - 1);
      setBlocks(prev);
      setDirty(true);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      if (!next) return;
      setHistoryIndex(historyIndex + 1);
      setBlocks(next);
      setDirty(true);
    }
  }, [history, historyIndex]);

  const loadPreset = useCallback(
    (name: string) => {
      const preset = PRESET_TEMPLATES[name];
      if (!preset) return;
      commit(JSON.parse(JSON.stringify(preset)) as BlockConfig[]);
      setSelectedBlockId(preset[0]?.id ?? null);
    },
    [commit]
  );

  const loadBlocks = useCallback(
    (next: BlockConfig[]) => {
      commit(next);
      setSelectedBlockId(next[0]?.id ?? null);
    },
    [commit]
  );

  return {
    setSelectedBlockId,
    blocks,
    pageSettings,
    selectedBlockId,
    viewport,
    activeTab,
    isPreviewMode,
    dirty,
    historyIndex,
    historyLength: history.length,
    addBlock,
    updateBlockProps,
    duplicateBlock,
    moveBlock,
    toggleBlockVisibility,
    deleteBlock,
    setPageSettings,
    setViewport,
    setActiveTab,
    setPreviewMode,
    undo,
    redo,
    loadPreset,
    loadBlocks,
  };
}
