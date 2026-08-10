"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Element, Section, Viewport, ViewportLayout, PageSettings, Page } from "./lib/block-types";
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
  isSaving: boolean;
  toast: string | null;
  canUndo: boolean;
  canRedo: boolean;
  snapToGrid: boolean;
  snapGuideX: number | null;
  addMenuOpen: boolean;
  activeFlyout: 'elements' | 'sections_list' | 'pages' | null;
  isSectionModalOpen: boolean;
  pages: Page[];
  currentPageId: string;
  currentPage: Page | undefined;
  pageSettings: PageSettings;

  showToast: (msg: string) => void;
  setViewport: (v: Viewport) => void;
  setInspectorTab: (tab: 'position' | 'style') => void;
  setIsPreviewMode: (v: boolean) => void;
  setSnapToGrid: (v: boolean) => void;
  setSnapGuideX: (v: number | null) => void;
  setAddMenuOpen: (v: boolean) => void;
  setActiveFlyout: (f: 'elements' | 'sections_list' | 'pages' | null) => void;
  setIsSectionModalOpen: (v: boolean) => void;
  setPageSettings: (settings: PageSettings) => void;

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
  saveWebsite: () => Promise<void>;

  addPage: (title: string) => void;
  removePage: (pageId: string) => void;
  updatePage: (pageId: string, updates: Partial<Pick<Page, 'title' | 'slug' | 'pageSettings' | 'navigationSettings'>>) => void;
  setCurrentPage: (pageId: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  duplicatePage: (pageId: string) => void;
  setHomePage: (pageId: string) => void;
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

const DEFAULT_PAGE_SETTINGS: PageSettings = {
  title: 'My Website',
  bgColor: '#ffffff',
  fontFamily: 'font-sans',
};

const DEFAULT_HOME_PAGE: Page = {
  id: 'home',
  title: 'Beranda (Home)',
  slug: '/',
  sections: [],
  pageSettings: DEFAULT_PAGE_SETTINGS,
  isHomePage: true,
  sortOrder: 0,
};

export function EditorProvider({
  children,
  initialSections = [],
  initialPages,
  initialPageSettings,
  onSave,
}: {
  children: ReactNode;
  initialSections?: Section[];
  initialPages?: Page[];
  initialPageSettings?: PageSettings;
  onSave?: (pages: Page[], pageSettings: PageSettings) => Promise<void>;
}) {
  const resolvedInitialPages: Page[] = initialPages?.length
    ? initialPages
    : [{ ...DEFAULT_HOME_PAGE, sections: initialSections, pageSettings: initialPageSettings || DEFAULT_PAGE_SETTINGS }];

  const [pages, setPages] = useState<Page[]>(resolvedInitialPages);
  const [currentPageId, setCurrentPageId] = useState<string>(
    resolvedInitialPages.find(p => p.isHomePage)?.id || resolvedInitialPages[0]?.id || ''
  );
  const initialHomeSections = resolvedInitialPages.find(p => p.isHomePage)?.sections || resolvedInitialPages[0]?.sections || [];
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(initialHomeSections[0]?.id || null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(initialHomeSections[0]?.elements[0]?.id || null);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [inspectorTab, setInspectorTab] = useState<'position' | 'style'>('position');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapGuideX, setSnapGuideX] = useState<number | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [activeFlyout, setActiveFlyout] = useState<'elements' | 'sections_list' | 'pages' | null>(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [pageSettings, setPageSettings] = useState<PageSettings>(initialPageSettings || DEFAULT_PAGE_SETTINGS);

  const currentPage = pages.find(p => p.id === currentPageId);
  const currentSections = currentPage?.sections || [];

  const [history, setHistory] = useState<Page[][]>([resolvedInitialPages]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const pushHistory = useCallback((nextPages: Page[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextPages);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }, [history, historyIndex]);

  const updateCurrentPageSections = useCallback((newSections: Section[]) => {
    const updatedPages = pages.map(p =>
      p.id === currentPageId ? { ...p, sections: newSections } : p
    );
    pushHistory(updatedPages);
    setPages(updatedPages);
  }, [pages, currentPageId, pushHistory]);

  const saveWebsite = useCallback(async () => {
    if (!onSave) {
      showToast("No save handler configured");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(pages, pageSettings);
      showToast("Website saved successfully!");
    } catch (err) {
      showToast("Failed to save: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  }, [onSave, pages, pageSettings, showToast]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevPages = history[historyIndex - 1];
      if (prevPages) {
        setHistoryIndex(historyIndex - 1);
        setPages(prevPages);
        showToast("Undo berhasil dilakukan");
      }
    }
  }, [historyIndex, history, showToast]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextPages = history[historyIndex + 1];
      if (nextPages) {
        setHistoryIndex(historyIndex + 1);
        setPages(nextPages);
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
    const updated = [...currentSections, newSec];
    updateCurrentPageSections(updated);
    setSelectedSectionId(newSec.id);
    setIsSectionModalOpen(false);
    setAddMenuOpen(false);
    showToast(`Seksi templat "${tmpl.title}" ditambahkan!`);
  }, [currentSections, updateCurrentPageSections, showToast]);

  const deleteSection = useCallback((sectionId: string) => {
    if (currentSections.length <= 1) {
      showToast("Harus ada minimal 1 Seksi di halaman!");
      return;
    }
    const updated = currentSections.filter(s => s.id !== sectionId);
    updateCurrentPageSections(updated);
    if (updated[0]) {
      setSelectedSectionId(updated[0].id);
    }
    showToast("Seksi dihapus");
  }, [currentSections, updateCurrentPageSections, showToast]);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    const idx = currentSections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= currentSections.length) return;
    const reordered = [...currentSections];
    const [moved] = reordered.splice(idx, 1);
    if (moved) {
      reordered.splice(newIdx, 0, moved);
    }
    updateCurrentPageSections(reordered);
  }, [currentSections, updateCurrentPageSections]);

  const addElement = useCallback((preset: typeof ELEMENT_PRESETS[number], sectionId?: string) => {
    const targetSecId = sectionId || selectedSectionId;
    if (!targetSecId) return;
    const targetSec = currentSections.find(s => s.id === targetSecId);
    if (!targetSec) return;

    const baseLayouts = JSON.parse(JSON.stringify(preset.defaultLayouts));
    const newElement: Element = {
      id: createUniqueId('el'),
      type: preset.type,
      ...JSON.parse(JSON.stringify(preset.defaultProps)),
      layouts: baseLayouts,
      zIndex: 10
    };

    const updated = currentSections.map(sec => {
      if (sec.id === targetSecId) {
        return { ...sec, elements: [...sec.elements, newElement] };
      }
      return sec;
    });

    updateCurrentPageSections(updated);
    setSelectedSectionId(targetSecId);
    setSelectedElementId(newElement.id);
    setAddMenuOpen(false);
    showToast(`Elemen "${preset.label}" ditambahkan`);
  }, [currentSections, selectedSectionId, updateCurrentPageSections, showToast]);

  const duplicateElement = useCallback((sectionId: string, elementId: string) => {
    const updated = currentSections.map(sec => {
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
    updateCurrentPageSections(updated);
    showToast("Elemen diduplikasi!");
  }, [currentSections, updateCurrentPageSections, showToast]);

  const deleteElement = useCallback((sectionId: string, elementId: string) => {
    const updated = currentSections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, elements: sec.elements.filter(e => e.id !== elementId) };
      }
      return sec;
    });
    updateCurrentPageSections(updated);
    setSelectedElementId(null);
    showToast("Elemen dihapus");
  }, [currentSections, updateCurrentPageSections, showToast]);

  const updateElementViewportLayout = useCallback((sectionId: string, elementId: string, vp: Viewport, layoutProps: Partial<ViewportLayout>) => {
    setPages(prev => prev.map(p => {
      if (p.id !== currentPageId) return p;
      return {
        ...p,
        sections: p.sections.map(sec => {
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
        })
      };
    }));
  }, [currentPageId]);

  const updateElementProps = useCallback((sectionId: string, elementId: string, newProps: Partial<Element>) => {
    setPages(prev => prev.map(p => {
      if (p.id !== currentPageId) return p;
      return {
        ...p,
        sections: p.sections.map(sec => {
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
        })
      };
    }));
  }, [currentPageId]);

  const updateSectionHeight = useCallback((sectionId: string, vp: Viewport, height: number) => {
    setPages(prev => prev.map(p => {
      if (p.id !== currentPageId) return p;
      return {
        ...p,
        sections: p.sections.map(sec => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              heights: { ...(sec.heights || {}), [vp]: height }
            };
          }
          return sec;
        })
      };
    }));
  }, [currentPageId]);

  const addPage = useCallback((title: string) => {
    const newPage: Page = {
      id: createUniqueId('page'),
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      sections: [],
      pageSettings: { ...DEFAULT_PAGE_SETTINGS },
      isHomePage: false,
      sortOrder: pages.length,
    };
    const updatedPages = [...pages, newPage];
    pushHistory(updatedPages);
    setPages(updatedPages);
    setCurrentPageId(newPage.id);
    showToast(`Halaman "${title}" ditambahkan`);
  }, [pages, pushHistory, showToast]);

  const removePage = useCallback((pageId: string) => {
    if (pages.length <= 1) {
      showToast("Harus ada minimal 1 halaman!");
      return;
    }
    const target = pages.find(p => p.id === pageId);
    if (target?.isHomePage) {
      showToast("Halaman utama tidak bisa dihapus!");
      return;
    }
    const updatedPages = pages.filter(p => p.id !== pageId);
    pushHistory(updatedPages);
    setPages(updatedPages);
    if (currentPageId === pageId) {
      setCurrentPageId(updatedPages[0]?.id || '');
    }
    showToast("Halaman dihapus");
  }, [pages, currentPageId, pushHistory, showToast]);

  const updatePage = useCallback((pageId: string, updates: Partial<Pick<Page, 'title' | 'slug' | 'pageSettings' | 'navigationSettings'>>) => {
    const updatedPages = pages.map(p =>
      p.id === pageId ? { ...p, ...updates } : p
    );
    pushHistory(updatedPages);
    setPages(updatedPages);
    showToast("Halaman diperbarui");
  }, [pages, pushHistory, showToast]);

  const setCurrentPage = useCallback((pageId: string) => {
    setCurrentPageId(pageId);
  }, []);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    const reordered = [...pages];
    const [moved] = reordered.splice(fromIndex, 1);
    if (moved) {
      reordered.splice(toIndex, 0, moved);
    }
    const updatedPages = reordered.map((p, i) => ({ ...p, sortOrder: i }));
    pushHistory(updatedPages);
    setPages(updatedPages);
  }, [pages, pushHistory]);

  const duplicatePage = useCallback((pageId: string) => {
    const source = pages.find(p => p.id === pageId);
    if (!source) return;
    const newPage: Page = {
      ...JSON.parse(JSON.stringify(source)),
      id: createUniqueId('page'),
      title: source.title + ' (Salinan)',
      slug: source.slug + '-copy',
      isHomePage: false,
      sortOrder: pages.length,
    };
    const updatedPages = [...pages, newPage];
    pushHistory(updatedPages);
    setPages(updatedPages);
    setCurrentPageId(newPage.id);
    showToast(`Halaman "${newPage.title}" diduplikasi`);
  }, [pages, pushHistory, showToast]);

  const setHomePage = useCallback((pageId: string) => {
    const updatedPages = pages.map(p => ({
      ...p,
      isHomePage: p.id === pageId,
    }));
    pushHistory(updatedPages);
    setPages(updatedPages);
    showToast("Halaman utama diperbarui");
  }, [pages, pushHistory, showToast]);

  const value: EditorContextValue = {
    sections: currentSections,
    selectedSectionId,
    selectedElementId,
    viewport,
    inspectorTab,
    isPreviewMode,
    isSaving,
    toast,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    snapToGrid,
    snapGuideX,
    addMenuOpen,
    activeFlyout,
    isSectionModalOpen,
    pages,
    currentPageId,
    currentPage,
    pageSettings,
    showToast,
    setViewport,
    setInspectorTab,
    setIsPreviewMode,
    setSnapToGrid,
    setSnapGuideX,
    setAddMenuOpen,
    setActiveFlyout,
    setIsSectionModalOpen,
    setPageSettings,
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
    generateFullHTML: () => generateFullHTML(currentSections),
    saveWebsite,
    addPage,
    removePage,
    updatePage,
    setCurrentPage,
    reorderPages,
    duplicatePage,
    setHomePage,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}
