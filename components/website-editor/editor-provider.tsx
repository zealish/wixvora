"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import type { Block, BlockType, PageSettings } from "./lib/block-types";
import { BLOCK_CATALOG } from "./lib/block-definitions";
import { PRESET_TEMPLATES } from "./lib/template-presets";

interface EditorContextValue {
  blocks: Block[];
  selectedBlockId: string;
  viewport: "desktop" | "tablet" | "mobile";
  activeTab: "blocks" | "layers" | "templates" | "settings";
  inspectorTab: "content" | "style" | "advanced";
  isEditingInline: boolean;
  isPreviewMode: boolean;
  showExportModal: boolean;
  toast: string | null;
  pageSettings: PageSettings;
  canUndo: boolean;
  canRedo: boolean;
  activeBlock: Block | undefined;

  addBlock: (type: BlockType) => void;
  duplicateBlock: (id: string) => void;
  deleteBlock: (id: string) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
  toggleBlockVisibility: (id: string) => void;
  updateBlockProps: (newProps: any) => void;
  updateProps: (id: string, newProps: any) => void;
  setBlocks: (blocks: Block[]) => void;
  selectBlock: (id: string) => void;
  setSelectedBlockId: (id: string) => void;
  setViewport: (v: "desktop" | "tablet" | "mobile") => void;
  setActiveTab: (tab: "blocks" | "layers" | "templates" | "settings") => void;
  setInspectorTab: (tab: "content" | "style" | "advanced") => void;
  setIsPreviewMode: (v: boolean) => void;
  setIsEditingInline: (v: boolean) => void;
  setShowExportModal: (v: boolean) => void;
  setPreview: (v: boolean) => void;
  setPageSettings: (settings: Partial<PageSettings>) => void;
  updatePageSettings: (settings: Partial<PageSettings>) => void;
  undo: () => void;
  redo: () => void;
  showToast: (msg: string) => void;
  setToast: (msg: string | null) => void;
  importJSON: (json: any) => void;
  exportJSON: () => string;
  execFormatCommand: (command: string) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}

function generateId(): string {
  return "layer_" + Math.random().toString(36).slice(2, 10);
}

function getDefaultProps(type: BlockType): any {
  for (const cat of BLOCK_CATALOG) {
    const found = cat.items.find((item) => item.type === type);
    if (found) return { ...found.defaultProps };
  }
  return {};
}

const initialBlocks = (PRESET_TEMPLATES.saas?.blocks ?? []).map((b) => ({ ...b }));

export function EditorProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocksState] = useState<Block[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string>(initialBlocks[0]?.id ?? "");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"blocks" | "layers" | "templates" | "settings">("blocks");
  const [inspectorTab, setInspectorTab] = useState<"content" | "style" | "advanced">("content");
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pageSettings, setPageSettingsState] = useState<PageSettings>({
    title: "My Website",
    bgColor: "#ffffff",
    fontFamily: "Inter, sans-serif",
  });

  const historyRef = useRef<Block[][]>([initialBlocks]);
  const historyIndexRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushHistory = useCallback((newBlocks: Block[]) => {
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(newBlocks.map((b) => ({ ...b, props: { ...b.props } })));
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const setBlocks = useCallback(
    (newBlocks: Block[]) => {
      setBlocksState(newBlocks);
      if (newBlocks.length > 0 && !newBlocks.find((b) => b.id === selectedBlockId)) {
        setSelectedBlockId(newBlocks[0]!.id);
      }
      pushHistory(newBlocks);
    },
    [selectedBlockId, pushHistory]
  );

  const activeBlock = blocks.find((b) => b.id === selectedBlockId);

  const addBlock = useCallback(
    (type: BlockType) => {
      const newBlock: Block = {
        id: generateId(),
        type,
        hidden: false,
        props: getDefaultProps(type),
      };
      const newBlocks = [...blocks, newBlock];
      setBlocksState(newBlocks);
      setSelectedBlockId(newBlock.id);
      pushHistory(newBlocks);
    },
    [blocks, pushHistory]
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const original = blocks[idx]!;
      const clone: Block = {
        id: generateId(),
        type: original.type,
        hidden: original.hidden,
        props: { ...original.props, layerName: (original.props.layerName || original.type) + " (Salinan)" },
      };
      const newBlocks = [...blocks];
      newBlocks.splice(idx + 1, 0, clone);
      setBlocksState(newBlocks);
      setSelectedBlockId(clone.id);
      pushHistory(newBlocks);
    },
    [blocks, pushHistory]
  );

  const deleteBlock = useCallback(
    (id: string) => {
      if (blocks.length <= 1) return;
      const newBlocks = blocks.filter((b) => b.id !== id);
      setBlocksState(newBlocks);
      if (selectedBlockId === id) {
        setSelectedBlockId(newBlocks[0]?.id ?? "");
      }
      pushHistory(newBlocks);
    },
    [blocks, selectedBlockId, pushHistory]
  );

  const moveBlockUp = useCallback(
    (id: string) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx <= 0) return;
      const newBlocks = [...blocks];
      const temp = newBlocks[idx - 1]!;
      newBlocks[idx - 1] = newBlocks[idx]!;
      newBlocks[idx] = temp;
      setBlocksState(newBlocks);
      pushHistory(newBlocks);
    },
    [blocks, pushHistory]
  );

  const moveBlockDown = useCallback(
    (id: string) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1 || idx >= blocks.length - 1) return;
      const newBlocks = [...blocks];
      const temp = newBlocks[idx]!;
      newBlocks[idx] = newBlocks[idx + 1]!;
      newBlocks[idx + 1] = temp;
      setBlocksState(newBlocks);
      pushHistory(newBlocks);
    },
    [blocks, pushHistory]
  );

  const toggleBlockVisibility = useCallback(
    (id: string) => {
      setBlocksState((prev) => {
        const newBlocks = prev.map((b) => (b.id === id ? { ...b, hidden: !b.hidden } : b));
        pushHistory(newBlocks);
        return newBlocks;
      });
    },
    [pushHistory]
  );

  const updateBlockProps = useCallback(
    (newProps: any) => {
      if (!selectedBlockId) return;
      setBlocksState((prev) => {
        const newBlocks = prev.map((b) =>
          b.id === selectedBlockId ? { ...b, props: { ...b.props, ...newProps } } : b
        );
        pushHistory(newBlocks);
        return newBlocks;
      });
    },
    [selectedBlockId, pushHistory]
  );

  const updateProps = useCallback(
    (id: string, newProps: any) => {
      setBlocksState((prev) => {
        const newBlocks = prev.map((b) =>
          b.id === id ? { ...b, props: { ...b.props, ...newProps } } : b
        );
        pushHistory(newBlocks);
        return newBlocks;
      });
    },
    [pushHistory]
  );

  const selectBlock = useCallback((id: string) => {
    setSelectedBlockId(id);
  }, []);

  const setPageSettings = useCallback((settings: Partial<PageSettings>) => {
    setPageSettingsState((prev) => ({ ...prev, ...settings }));
  }, []);

  const updatePageSettings = useCallback((settings: Partial<PageSettings>) => {
    setPageSettingsState((prev) => ({ ...prev, ...settings }));
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    if (!snapshot) return;
    const restored = snapshot.map((b) => ({
      ...b,
      props: { ...b.props },
    }));
    setBlocksState(restored);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    if (!snapshot) return;
    const restored = snapshot.map((b) => ({
      ...b,
      props: { ...b.props },
    }));
    setBlocksState(restored);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const setPreview = useCallback((v: boolean) => {
    setIsPreviewMode(v);
  }, []);

  const importJSON = useCallback(
    (json: any) => {
      try {
        if (json.blocks && Array.isArray(json.blocks)) {
          setBlocksState(json.blocks);
          if (json.pageSettings) setPageSettingsState(json.pageSettings);
          if (json.blocks.length > 0) setSelectedBlockId(json.blocks[0].id);
          pushHistory(json.blocks);
          showToast("Import berhasil!");
        }
      } catch {
        showToast("Gagal import JSON");
      }
    },
    [pushHistory, showToast]
  );

  const exportJSON = useCallback(() => {
    try {
      return JSON.stringify({ blocks, pageSettings }, null, 2);
    } catch {
      return "{}";
    }
  }, [blocks, pageSettings]);

  const execFormatCommand = useCallback((command: string) => {
    try {
      document.execCommand(command, false);
    } catch {
      // ignore
    }
  }, []);

  const value: EditorContextValue = {
    blocks,
    selectedBlockId,
    viewport,
    activeTab,
    inspectorTab,
    isEditingInline,
    isPreviewMode,
    showExportModal,
    toast,
    pageSettings,
    canUndo,
    canRedo,
    activeBlock,
    addBlock,
    duplicateBlock,
    deleteBlock,
    moveBlockUp,
    moveBlockDown,
    toggleBlockVisibility,
    updateBlockProps,
    updateProps,
    setBlocks,
    selectBlock,
    setSelectedBlockId,
    setViewport,
    setActiveTab,
    setInspectorTab,
    setIsPreviewMode,
    setIsEditingInline,
    setShowExportModal,
    setPreview,
    setPageSettings,
    updatePageSettings,
    undo,
    redo,
    showToast,
    setToast,
    importJSON,
    exportJSON,
    execFormatCommand,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
