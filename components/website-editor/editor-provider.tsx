"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Element, Section, Viewport, ViewportLayout } from "./lib/block-types";
import { SECTION_TEMPLATES } from "./lib/section-templates";
import { ELEMENT_PRESETS } from "./lib/element-presets";
import { getLayout, VIEWPORT_WIDTHS } from "./lib/viewport-utils";
import { generateFullHTML } from "./lib/html-generator";

interface EditorContextValue {
  sections: Section[];
  selectedSectionId: string | null;
  selectedElementId: string | null;
  viewport: Viewport;
  inspectorTab: 'position' | 'style';
  isPreviewMode: boolean;
  showExportModal: boolean;
  toast: string | null;
  canUndo: boolean;
  canRedo: boolean;
  snapToGrid: boolean;
  snapGuideX: number | null;
  addMenuOpen: boolean;
  activeFlyout: 'elements' | 'sections_list' | 'pages' | null;
  isSectionModalOpen: boolean;
  pages: { id: string; title: string; isMain: boolean }[];

  showToast: (msg: string) => void;
  setViewport: (v: Viewport) => void;
  setInspectorTab: (tab: 'position' | 'style') => void;
  setIsPreviewMode: (v: boolean) => void;
  setShowExportModal: (v: boolean) => void;
  setSnapToGrid: (v: boolean) => void;
  setSnapGuideX: (v: number | null) => void;
  setAddMenuOpen: (v: boolean) => void;
  setActiveFlyout: (f: 'elements' | 'sections_list' | 'pages' | null) => void;
  setIsSectionModalOpen: (v: boolean) => void;

  selectSection: (id: string) => void;
  selectElement: (id: string | null) => void;
  addSectionFromTemplate: (templateId: string) => void;
  deleteSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  addElement: (preset: typeof ELEMENT_PRESETS[number], sectionId?: string) => void;
  duplicateElement: (sectionId: string, elementId: string) => void;
  deleteElement: (sectionId: string, elementId: string) => void;
  updateElementViewportLayout: (sectionId: string, elementId: string, vp: Viewport, layoutProps: Partial<ViewportLayout>) => void;
  updateElementProps: (sectionId: string, elementId: string, newProps: Partial<Element>) => void;
  updateSectionHeight: (sectionId: string, vp: Viewport, height: number) => void;
  undo: () => void;
  redo: () => void;
  generateFullHTML: () => string;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}

function createUniqueId(prefix = 'item'): string {
  return prefix + '_' + Math.random().toString(36).substr(2, 9);
}

const INITIAL_SECTIONS: Section[] = [
  SECTION_TEMPLATES[0]!.factory(),
  SECTION_TEMPLATES[1]!.factory()
];

export function EditorProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(INITIAL_SECTIONS[0]?.id || null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(INITIAL_SECTIONS[0]?.elements[0]?.id || null);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [inspectorTab, setInspectorTab] = useState<'position' | 'style'>('position');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapGuideX, setSnapGuideX] = useState<number | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [activeFlyout, setActiveFlyout] = useState<'elements' | 'sections_list' | 'pages' | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [pages] = useState([{ id: 'home', title: 'Beranda (Home)', isMain: true }]);

  const [history, setHistory] = useState<Section[][]>([INITIAL_SECTIONS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const updateSectionsState = useCallback((newSections: Section[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newSections);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setSections(newSections);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevSections = history[historyIndex - 1];
      if (prevSections) {
        setHistoryIndex(historyIndex - 1);
        setSections(prevSections);
        showToast("Undo berhasil dilakukan");
      }
    }
  }, [historyIndex, history, showToast]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextSections = history[historyIndex + 1];
      if (nextSections) {
        setHistoryIndex(historyIndex + 1);
        setSections(nextSections);
        showToast("Redo berhasil dilakukan");
      }
    }
  }, [historyIndex, history, showToast]);

  const selectSection = useCallback((id: string) => {
    setSelectedSectionId(id);
    setSelectedElementId(null);
  }, []);

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  const addSectionFromTemplate = useCallback((templateId: string) => {
    const tmpl = SECTION_TEMPLATES.find(t => t.id === templateId) || SECTION_TEMPLATES[5];
    if (!tmpl) return;
    const newSec = tmpl.factory();
    const updated = [...sections, newSec];
    updateSectionsState(updated);
    setSelectedSectionId(newSec.id);
    setIsSectionModalOpen(false);
    setAddMenuOpen(false);
    showToast(`Seksi templat "${tmpl.title}" ditambahkan!`);
  }, [sections, updateSectionsState, showToast]);

  const deleteSection = useCallback((sectionId: string) => {
    if (sections.length <= 1) {
      showToast("Harus ada minimal 1 Seksi di halaman!");
      return;
    }
    const updated = sections.filter(s => s.id !== sectionId);
    updateSectionsState(updated);
    if (updated[0]) {
      setSelectedSectionId(updated[0].id);
    }
    showToast("Seksi dihapus");
  }, [sections, updateSectionsState, showToast]);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(idx, 1);
    if (moved) {
      reordered.splice(newIdx, 0, moved);
    }
    updateSectionsState(reordered);
  }, [sections, updateSectionsState]);

  const addElement = useCallback((preset: typeof ELEMENT_PRESETS[number], sectionId?: string) => {
    const targetSecId = sectionId || selectedSectionId;
    if (!targetSecId) return;
    const targetSec = sections.find(s => s.id === targetSecId);
    if (!targetSec) return;

    const baseLayouts = JSON.parse(JSON.stringify(preset.defaultLayouts));
    const newElement: Element = {
      id: createUniqueId('el'),
      type: preset.type,
      ...JSON.parse(JSON.stringify(preset.defaultProps)),
      layouts: baseLayouts,
      zIndex: 10
    };

    const updated = sections.map(sec => {
      if (sec.id === targetSecId) {
        return { ...sec, elements: [...sec.elements, newElement] };
      }
      return sec;
    });

    updateSectionsState(updated);
    setSelectedSectionId(targetSecId);
    setSelectedElementId(newElement.id);
    setAddMenuOpen(false);
    showToast(`Elemen "${preset.label}" ditambahkan`);
  }, [sections, selectedSectionId, updateSectionsState, showToast]);

  const duplicateElement = useCallback((sectionId: string, elementId: string) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        const target = sec.elements.find(e => e.id === elementId);
        if (!target) return sec;

        const copy = JSON.parse(JSON.stringify(target));
        copy.id = createUniqueId('el');
        copy.name = (copy.name || 'Elemen') + ' (Salinan)';

        (['desktop', 'tablet', 'mobile'] as Viewport[]).forEach(vp => {
          const l = getLayout(copy, vp);
          copy.layouts[vp] = {
            ...l,
            x: Math.min(l.x + 20, VIEWPORT_WIDTHS[vp] - l.width - 10),
            y: l.y + 20
          };
        });

        return { ...sec, elements: [...sec.elements, copy] };
      }
      return sec;
    });
    updateSectionsState(updated);
    showToast("Elemen diduplikasi!");
  }, [sections, updateSectionsState, showToast]);

  const deleteElement = useCallback((sectionId: string, elementId: string) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, elements: sec.elements.filter(e => e.id !== elementId) };
      }
      return sec;
    });
    updateSectionsState(updated);
    setSelectedElementId(null);
    showToast("Elemen dihapus");
  }, [sections, updateSectionsState, showToast]);

  const updateElementViewportLayout = useCallback((sectionId: string, elementId: string, vp: Viewport, layoutProps: Partial<ViewportLayout>) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          elements: sec.elements.map(el => {
            if (el.id === elementId) {
              const currentVPLayout = getLayout(el, vp);
              const updatedLayouts = {
                ...el.layouts,
                [vp]: { ...currentVPLayout, ...layoutProps }
              };
              return { ...el, layouts: updatedLayouts };
            }
            return el;
          })
        };
      }
      return sec;
    }));
  }, []);

  const updateElementProps = useCallback((sectionId: string, elementId: string, newProps: Partial<Element>) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          elements: sec.elements.map(el => {
            if (el.id === elementId) {
              return { ...el, ...newProps };
            }
            return el;
          })
        };
      }
      return sec;
    }));
  }, []);

  const updateSectionHeight = useCallback((sectionId: string, vp: Viewport, height: number) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          heights: { ...(sec.heights || {}), [vp]: height }
        };
      }
      return sec;
    }));
  }, []);

  const value: EditorContextValue = {
    sections,
    selectedSectionId,
    selectedElementId,
    viewport,
    inspectorTab,
    isPreviewMode,
    showExportModal,
    toast,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    snapToGrid,
    snapGuideX,
    addMenuOpen,
    activeFlyout,
    isSectionModalOpen,
    pages,
    showToast,
    setViewport,
    setInspectorTab,
    setIsPreviewMode,
    setShowExportModal,
    setSnapToGrid,
    setSnapGuideX,
    setAddMenuOpen,
    setActiveFlyout,
    setIsSectionModalOpen,
    selectSection,
    selectElement,
    addSectionFromTemplate,
    deleteSection,
    moveSection,
    addElement,
    duplicateElement,
    deleteElement,
    updateElementViewportLayout,
    updateElementProps,
    updateSectionHeight,
    undo,
    redo,
    generateFullHTML: () => generateFullHTML(sections)
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}
