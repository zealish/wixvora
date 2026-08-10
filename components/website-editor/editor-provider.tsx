"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import type { Block, BlockType, PageSettings, Section, Viewport } from "./lib/block-types";
import { BLOCK_CATALOG } from "./lib/block-definitions";
import { PRESET_TEMPLATES } from "./lib/template-presets";
import { loadEditorState, createDefaultState } from "./lib/section-migration";
import { SECTION_TEMPLATES } from "./lib/section-templates";
import { ELEMENT_PRESETS } from "./lib/element-presets";

interface EditorContextValue {
  blocks: Block[];
  selectedBlockId: string;
  selectedBlockIds: string[];
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
  // Canvas positioning & zoom/pan
  zoom: number;
  panX: number;
  panY: number;
  isDraggingCanvas: boolean;
  isPanning: boolean;
  gridEnabled: boolean;
  gridSize: number;
  dragStart: { screenX: number; screenY: number } | null;
  itemOffset: { x: number; y: number } | null;
  draggedBlockIds: string[];

  addBlock: (type: BlockType) => void;
  setDraggedBlockIds: (ids: string[]) => void;
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
  selectMultipleBlocks: (ids: string[], shiftClick?: boolean) => void;
  toggleBlockSelection: (id: string) => void;
  clearSelection: () => void;
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
  // Block position updates for drag functionality
  updateBlockPosition: (id: string, x: number, y: number) => void;
  // Canvas zoom & pan control
  setZoom: (z: number) => void;
  setPan: (x: number, y: number) => void;
  setIsDraggingCanvas: (v: boolean) => void;
  setIsPanning: (v: boolean) => void;
  setGridEnabled: (v: boolean) => void;
  setGridSize: (size: number) => void;
  setDragStart: (d: { screenX: number; screenY: number } | null) => void;
  setItemOffset: (offset: { x: number; y: number } | null) => void;

  // New section-based state
  sections: Section[];
  selectedSectionId: string | null;

  // Section operations
  addSection: (templateId: string) => void;
  deleteSection: (sectionId: string) => void;
  moveSectionUp: (sectionId: string) => void;
  moveSectionDown: (sectionId: string) => void;
  updateSectionHeight: (sectionId: string, height: number) => void;
  selectSection: (sectionId: string) => void;

  // Viewport-aware block operations
  addBlockToSection: (type: BlockType, sectionId: string) => void;
  updateBlockLayout: (sectionId: string, blockId: string, viewport: Viewport, layout: Partial<import("./lib/block-types").ViewportLayout>) => void;
  findBlock: (blockId: string) => { section: Section; block: Block } | null;

  // Snap grid & presets
  snapGrid: boolean;
  setSnapGrid: (v: boolean) => void;
  snapGuideX: number | null;
  setSnapGuideX: (v: number | null) => void;
  addElementFromPreset: (presetIndex: number) => void;
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

function isContainerType(type: BlockType): boolean {
  return type === "container" || type === "grid_custom";
}

function findBlockInTree(blocks: Block[], id: string): Block | undefined {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const found = findBlockInTree(b.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function removeBlockFromTree(blocks: Block[], id: string): Block[] {
  return blocks
    .filter((b) => b.id !== id)
    .map((b) =>
      b.children ? { ...b, children: removeBlockFromTree(b.children, id) } : b
    );
}

function insertBlockIntoContainer(
  blocks: Block[],
  containerId: string,
  newBlock: Block
): Block[] {
  return blocks.map((b) => {
    if (b.id === containerId && isContainerType(b.type)) {
      return { ...b, children: [...(b.children || []), newBlock] };
    }
    if (b.children) {
      return { ...b, children: insertBlockIntoContainer(b.children, containerId, newBlock) };
    }
    return b;
  });
}

function duplicateChildren(children: Block[]): Block[] {
  return children.map((c) => ({
    ...c,
    id: generateId(),
    props: { ...c.props },
    children: c.children ? duplicateChildren(c.children) : undefined,
  }));
}

function moveBlockInTree(blocks: Block[], id: string, direction: "up" | "down"): Block[] {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]!;
    if (b.id === id) {
      const swapIdx = direction === "up" ? i - 1 : i + 1;
      if (swapIdx < 0 || swapIdx >= blocks.length) {
        // Try moving in children
        if (b.children) {
          const newChildren = moveBlockInTree(b.children, id, direction);
          if (newChildren !== b.children) {
            return blocks.map((blk) => (blk.id === id ? { ...blk, children: newChildren } : blk));
          }
        }
        return blocks;
      }
      const newBlocks = [...blocks];
      const temp = newBlocks[i]!;
      newBlocks[i] = newBlocks[swapIdx]!;
      newBlocks[swapIdx] = temp;
      return newBlocks;
    }
    if (b.children) {
      const newChildren = moveBlockInTree(b.children, id, direction);
      if (newChildren !== b.children) {
        return blocks.map((blk) => (blk.id === b.id ? { ...blk, children: newChildren } : blk));
      }
    }
  }
  return blocks;
}

function updateBlockInTree(blocks: Block[], id: string, newProps: any): Block[] {
  return blocks.map((b) => {
    if (b.id === id) {
      return { ...b, props: { ...b.props, ...newProps } };
    }
    if (b.children) {
      return { ...b, children: updateBlockInTree(b.children, id, newProps) };
    }
    return b;
  });
}

/**
 * Update block position (x/y coordinates in canvas space)
 * If block doesn't have x/y yet, set them to the new values
 */
function updateBlockPositionInTree(blocks: Block[], id: string, newX: number, newY: number): Block[] {
  return blocks.map((b) => {
    if (b.id === id) {
      return { ...b, x: newX, y: newY };
    }
    if (b.children) {
      return { ...b, children: updateBlockPositionInTree(b.children, id, newX, newY) };
    }
    return b;
  });
}

function toggleVisibilityInTree(blocks: Block[], id: string): Block[] {
  return blocks.map((b) => {
    if (b.id === id) {
      return { ...b, hidden: !b.hidden };
    }
    if (b.children) {
      return { ...b, children: toggleVisibilityInTree(b.children, id) };
    }
    return b;
  });
}

const initialBlocks = (PRESET_TEMPLATES.saas?.blocks ?? []).map((b) => ({ ...b }));

export function EditorProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocksState] = useState<Block[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string>(initialBlocks[0]?.id ?? "");
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
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
  // Canvas positioning & zoom/pan
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [gridEnabled, setGridEnabled] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(20);
  const [dragStart, setDragStart] = useState<{ screenX: number; screenY: number } | null>(null);
  const [itemOffset, setItemOffset] = useState<{ x: number; y: number } | null>(null);
  // Track which block is currently being dragged (for multi-selection)
  const [draggedBlockIds, setDraggedBlockIds] = useState<string[]>([]);

  // Snap grid state
  const [snapGrid, setSnapGrid] = useState<boolean>(true);
  const [snapGuideX, setSnapGuideX] = useState<number | null>(null);

  // Section-based state (new)
  const [sections, setSections] = useState<Section[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('editor-sections') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return loadEditorState(parsed).sections;
      } catch {
        return createDefaultState().sections;
      }
    }
    return createDefaultState().sections;
  });

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    sections[0]?.id || null
  );

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
      if (newBlocks.length > 0 && !findBlockInTree(newBlocks, selectedBlockId)) {
        setSelectedBlockId(newBlocks[0]!.id);
      }
      pushHistory(newBlocks);
    },
    [selectedBlockId, pushHistory]
  );

  /**
   * Update block position (x/y) - for drag functionality
   * Sets position directly on the block object
   */
  const updateBlockPosition = useCallback((id: string, x: number, y: number) => {
    const newBlocks = updateBlockPositionInTree(blocks, id, x, y);
    setBlocksState(newBlocks);
    pushHistory(newBlocks);
  }, [blocks, pushHistory]);

  const activeBlock = findBlockInTree(blocks, selectedBlockId);

  const addBlock = useCallback(
    (type: BlockType) => {
      const newBlock: Block = {
        id: generateId(),
        type,
        hidden: false,
        props: getDefaultProps(type),
      };

      let newBlocks: Block[];
      if (selectedBlockId && activeBlock && isContainerType(activeBlock.type)) {
        newBlocks = insertBlockIntoContainer(blocks, selectedBlockId, newBlock);
      } else {
        newBlocks = [...blocks, newBlock];
      }

      setBlocksState(newBlocks);
      setSelectedBlockId(newBlock.id);
      pushHistory(newBlocks);
    },
    [blocks, selectedBlockId, activeBlock, pushHistory]
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const target = findBlockInTree(blocks, id);
      if (!target) return;
      const clone: Block = {
        id: generateId(),
        type: target.type,
        hidden: target.hidden,
        props: { ...target.props, layerName: (target.props.layerName || target.type) + " (Salinan)" },
        children: target.children ? duplicateChildren(target.children) : undefined,
      };

      const newBlocks = [...blocks];
      const idx = newBlocks.findIndex((b) => b.id === id);
      if (idx !== -1) {
        newBlocks.splice(idx + 1, 0, clone);
      } else {
        // Found in a container's children
        for (const b of newBlocks) {
          if (b.children) {
            const childIdx = b.children.findIndex((c) => c.id === id);
            if (childIdx !== -1) {
              b.children = [...b.children];
              b.children.splice(childIdx + 1, 0, clone);
              break;
            }
          }
        }
      }

      setBlocksState(newBlocks);
      setSelectedBlockId(clone.id);
      pushHistory(newBlocks);
    },
    [blocks, pushHistory]
  );

  const deleteBlock = useCallback(
    (id: string) => {
      const target = findBlockInTree(blocks, id);
      if (!target) return;
      const newBlocks = removeBlockFromTree(blocks, id);
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
      const newBlocks = moveBlockInTree(blocks, id, "up");
      if (newBlocks !== blocks) {
        setBlocksState(newBlocks);
        pushHistory(newBlocks);
      }
    },
    [blocks, pushHistory]
  );

  const moveBlockDown = useCallback(
    (id: string) => {
      const newBlocks = moveBlockInTree(blocks, id, "down");
      if (newBlocks !== blocks) {
        setBlocksState(newBlocks);
        pushHistory(newBlocks);
      }
    },
    [blocks, pushHistory]
  );

  const toggleBlockVisibility = useCallback(
    (id: string) => {
      const newBlocks = toggleVisibilityInTree(blocks, id);
      setBlocksState(newBlocks);
      pushHistory(newBlocks);
    },
    [blocks, pushHistory]
  );

  const updateBlockProps = useCallback(
    (newProps: any) => {
      if (!selectedBlockId) return;
      const newBlocks = updateBlockInTree(blocks, selectedBlockId, newProps);
      setBlocksState(newBlocks);
      pushHistory(newBlocks);
    },
    [blocks, selectedBlockId, pushHistory]
  );

  const updateProps = useCallback(
    (id: string, newProps: any) => {
      const newBlocks = updateBlockInTree(blocks, id, newProps);
      setBlocksState(newBlocks);
      pushHistory(newBlocks);
    },
    [blocks, pushHistory]
  );

  const selectBlock = useCallback((id: string) => {
    setSelectedBlockId(id);
  }, []);

  // Select multiple blocks - clear others if shiftClick is false
  const selectMultipleBlocks = useCallback((ids: string[], shiftClick = false) => {
    setSelectedBlockIds(shiftClick ? (prev: any) => [...new Set([...prev, ...ids])] : ids);
    // Keep selectedBlockId as the last selected block for backward compatibility
    if (ids.length > 0) {
      const lastId = ids[ids.length - 1] as string;
      setSelectedBlockId(lastId);
    } else {
      setSelectedBlockId("");
    }
  }, []);

  // Toggle a block in multi-selection
  const toggleBlockSelection = useCallback((id: string) => {
    setSelectedBlockIds((prev: any) => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        // Remove from selection
        return prev.filter((i: string) => i !== id);
      } else {
        // Add to selection
        return [...prev, id];
      }
    });
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedBlockIds([]);
    setSelectedBlockId("");
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

  /**
   * Import blocks from JSON data.
   * Preserves all block properties including optional x/y positioning coordinates.
   * The Block type includes x?: number and y?: number, which are automatically
   * preserved when restoring from JSON without any filtering or transformation.
   */
  const importJSON = useCallback(
    (json: any) => {
      try {
        if (json.blocks && Array.isArray(json.blocks)) {
          // Blocks (including x/y positions) are restored as-is - no filtering
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

  /**
   * Export current editor state to JSON string.
   * Includes all blocks with their properties and optional x/y positioning coordinates,
   * plus page settings. The Block interface's x?: number and y?: number properties
   * are automatically serialized by JSON.stringify when present.
   */
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

  // Canvas zoom & pan control
  const setZoomCallback = useCallback((z: number) => {
    const clampedZoom = Math.max(0.25, Math.min(z, 4));
    setZoom(clampedZoom);
  }, []);

  // Pan bounds: prevent infinite scrolling by clamping to reasonable limits
  const MIN_PAN = -50000;
  const MAX_PAN = 50000;
  
  const setPanCallback = useCallback((x: number, y: number) => {
    const clampedX = Math.max(MIN_PAN, Math.min(x, MAX_PAN));
    const clampedY = Math.max(MIN_PAN, Math.min(y, MAX_PAN));
    setPanX(clampedX);
    setPanY(clampedY);
  }, []);

  const setIsDraggingCanvasCallback = useCallback((v: boolean) => {
    setIsDraggingCanvas(v);
  }, []);

  const setIsPanningCallback = useCallback((v: boolean) => {
    setIsPanning(v);
  }, []);

  const setGridEnabledCallback = useCallback((v: boolean) => {
    setGridEnabled(v);
  }, []);

  const setGridSizeCallback = useCallback((size: number) => {
    setGridSize(size);
  }, []);

  const setDragStartCallback = useCallback((d: { screenX: number; screenY: number } | null) => {
    setDragStart(d);
  }, []);

  const setItemOffsetCallback = useCallback((offset: { x: number; y: number } | null) => {
    setItemOffset(offset);
  }, []);

  const setDraggedBlockIdsCallback = useCallback((ids: string[]) => {
    setDraggedBlockIds(ids);
  }, []);

  // Section CRUD operations
  const addSection = useCallback((templateId: string) => {
    const template = SECTION_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const newSection = template.factory();
    setSections(prev => [...prev, newSection]);
    setSelectedSectionId(newSection.id);
    showToast(`Section "${template.title}" added`);
  }, [showToast]);

  const deleteSection = useCallback((sectionId: string) => {
    setSections(prev => {
      if (prev.length <= 1) {
        showToast("Must have at least 1 section");
        return prev;
      }
      const filtered = prev.filter(s => s.id !== sectionId);
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(filtered[0]?.id || null);
      }
      return filtered;
    });
  }, [selectedSectionId, showToast]);

  const moveSectionUp = useCallback((sectionId: string) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === sectionId);
      if (idx <= 0) return prev;
      const newSections = [...prev];
      const temp = newSections[idx - 1]!;
      newSections[idx - 1] = newSections[idx]!;
      newSections[idx] = temp;
      return newSections;
    });
  }, []);

  const moveSectionDown = useCallback((sectionId: string) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === sectionId);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const newSections = [...prev];
      const temp = newSections[idx]!;
      newSections[idx] = newSections[idx + 1]!;
      newSections[idx + 1] = temp;
      return newSections;
    });
  }, []);

  const updateSectionHeight = useCallback((sectionId: string, height: number) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, heights: { ...s.heights, [viewport]: Math.max(150, height) } }
        : s
    ));
  }, [viewport]);

  const selectSection = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
  }, []);

  const addBlockToSection = useCallback((type: BlockType, sectionId: string) => {
    const defaultProps = getDefaultProps(type);
    const newBlock: Block = {
      id: generateId(),
      type,
      hidden: false,
      props: { ...defaultProps },
      zIndex: 10,
      layouts: {
        desktop: { x: 60, y: 60, width: 200, height: 100, hidden: false },
        tablet: { x: 40, y: 60, width: 200, height: 100, hidden: false },
        mobile: { x: 20, y: 60, width: Math.min(200, 335), height: 100, hidden: false }
      }
    };

    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, blocks: [...s.blocks, newBlock] }
        : s
    ));
    setSelectedBlockId(newBlock.id);
  }, [setSelectedBlockId]);

  const updateBlockLayout = useCallback((
    sectionId: string,
    blockId: string,
    vp: Viewport,
    layoutUpdate: Partial<import("./lib/block-types").ViewportLayout>
  ) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        blocks: s.blocks.map(b => {
          if (b.id !== blockId) return b;
          if (!b.layouts) return b;
          return {
            ...b,
            layouts: {
              ...b.layouts,
              [vp]: { ...b.layouts[vp], ...layoutUpdate }
            }
          };
        })
      };
    }));
  }, []);

  const findBlock = useCallback((blockId: string): { section: Section; block: Block } | null => {
    for (const section of sections) {
      const block = section.blocks.find(b => b.id === blockId);
      if (block) return { section, block };
    }
    return null;
  }, [sections]);

  const addElementFromPreset = useCallback((presetIndex: number) => {
    const preset = ELEMENT_PRESETS[presetIndex];
    if (!preset || !selectedSectionId) return;

    const newBlock: Block = {
      id: generateId(),
      type: preset.type,
      hidden: false,
      props: { ...preset.defaultProps },
      zIndex: 10,
      layouts: { ...preset.defaultLayouts },
    };

    setSections(prev => prev.map(s =>
      s.id === selectedSectionId
        ? { ...s, blocks: [...s.blocks, newBlock] }
        : s
    ));
    setSelectedBlockId(newBlock.id);
    showToast(`"${preset.label}" added`);
  }, [selectedSectionId, showToast]);

  const value: EditorContextValue = {
    blocks,
    selectedBlockId,
    selectedBlockIds,
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
    // Canvas positioning & zoom/pan
    zoom,
    panX,
    panY,
    isDraggingCanvas,
    isPanning,
    gridEnabled,
    gridSize,
    dragStart,
    itemOffset,
    draggedBlockIds,
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
    selectMultipleBlocks,
    toggleBlockSelection,
    clearSelection,
    // Position updates for drag
    updateBlockPosition,
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
    // Canvas zoom & pan control
    setZoom: setZoomCallback,
    setPan: setPanCallback,
    setIsDraggingCanvas: setIsDraggingCanvasCallback,
    setIsPanning: setIsPanningCallback,
    setGridEnabled: setGridEnabledCallback,
    setGridSize: setGridSizeCallback,
    setDragStart: setDragStartCallback,
    setItemOffset: setItemOffsetCallback,
    setDraggedBlockIds: setDraggedBlockIdsCallback,
    // Section-based state
    sections,
    selectedSectionId,
    addSection,
    deleteSection,
    moveSectionUp,
    moveSectionDown,
    updateSectionHeight,
    selectSection,
    addBlockToSection,
    updateBlockLayout,
    findBlock,
    // Snap grid & presets
    snapGrid,
    setSnapGrid,
    snapGuideX,
    setSnapGuideX,
    addElementFromPreset,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
