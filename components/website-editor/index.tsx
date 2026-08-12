"use client";

import { useState } from "react";
import { EditorProvider, useEditor } from "./editor-provider";
import type { Page, PageSettings } from "./lib/block-types";
import { ElementCatalogModal } from './modals/element-catalog-modal';
import "./rich-text/rich-text-content.css";
import { Topbar } from "./components/topbar";
import { PageTabBar } from "./components/page-tab-bar";
import { LeftSidebar } from "./components/left-sidebar";
import { FlyoutPanel } from "./components/flyout-panel";
import { CanvasArea } from "./components/canvas-area";
import { InspectorPanels } from "./components/inspector-panels";
import { SectionTemplatesModal } from "./components/section-templates-modal";

function EditorLayout({ backUrl, title }: { backUrl?: string | undefined; title?: string | undefined }) {
  const {
    addMenuOpen, isSectionModalOpen, toast,
    setAddMenuOpen, setIsSectionModalOpen,
    activeFlyout, setActiveFlyout,
    addElement,
  } = useEditor();

  const [isElementModalOpen, setIsElementModalOpen] = useState(false);
  const [dragOverContainerId, setDragOverContainerId] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 text-slate-800 font-sans antialiased selection:bg-blue-500 selection:text-white">

      <Topbar backUrl={backUrl} title={title} />
      <PageTabBar />

      <div className="flex-1 flex overflow-hidden relative">
        <LeftSidebar
          addMenuOpen={addMenuOpen}
          setAddMenuOpen={setAddMenuOpen}
          activeFlyout={activeFlyout}
          setActiveFlyout={setActiveFlyout}
          setIsElementModalOpen={setIsElementModalOpen}
          setIsSectionModalOpen={setIsSectionModalOpen}
        />

        {activeFlyout && (
          <FlyoutPanel
            activeFlyout={activeFlyout}
            setActiveFlyout={setActiveFlyout}
            setIsSectionModalOpen={setIsSectionModalOpen}
          />
        )}

        <CanvasArea
          setIsElementModalOpen={setIsElementModalOpen}
          dragOverContainerId={dragOverContainerId}
          setDragOverContainerId={setDragOverContainerId}
        />

        <InspectorPanels />
      </div>

      <SectionTemplatesModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
      />

      <ElementCatalogModal
        isOpen={isElementModalOpen}
        onClose={() => setIsElementModalOpen(false)}
        onSelectElement={(preset) => addElement(preset)}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default function WebsiteEditor({
  initialPages,
  onSave,
  backUrl,
  title,
}: {
  initialPages?: Page[];
  onSave?: (pages: Page[], pageSettings: PageSettings) => Promise<void>;
  backUrl?: string;
  title?: string;
}) {
  const props: Record<string, unknown> = {};
  if (initialPages !== undefined) props.initialPages = initialPages;
  if (onSave !== undefined) props.onSave = onSave;

  return (
    <EditorProvider {...props}>
      <EditorLayout backUrl={backUrl} title={title} />
    </EditorProvider>
  );
}
