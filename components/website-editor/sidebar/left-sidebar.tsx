"use client";

import { useState } from "react";
import { useEditor } from "../editor-provider";
import { BlockPalette } from "./block-palette";
import { TemplateSelector } from "./template-selector";
import { PageSettings } from "./page-settings";
import { Icon } from "../ui/icon-library";
import { getSectionHeight } from "../lib/viewport-utils";

const tabs = [
  { id: "blocks" as const, label: "Tambah", icon: "plus" as const },
  { id: "layers" as const, label: "Layer", icon: "layers" as const },
  { id: "templates" as const, label: "Template", icon: "layout" as const },
  { id: "settings" as const, label: "Halaman", icon: "settings" as const },
];

export function LeftSidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    isPreviewMode,
    sections,
    selectedSectionId,
    selectSection,
    moveSectionUp,
    moveSectionDown,
    deleteSection,
    viewport
  } = useEditor();
  
  const [showSectionModal, setShowSectionModal] = useState(false);
  // Modal will be implemented in Task 10
  void showSectionModal;

  if (isPreviewMode) return null;

  return (
    <div className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="grid grid-cols-4 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-50 text-blue-600"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Icon name={tab.icon} size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "blocks" && <BlockPalette />}
        {activeTab === "layers" && (
          <div className="h-full overflow-y-auto p-3">
            <div className="space-y-2">
              <button
                onClick={() => setShowSectionModal(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <Icon name="plus" className="w-4 h-4" />
                <span>Add Section Template</span>
              </button>

              <div className="space-y-2 pt-2">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    onClick={() => selectSection(sec.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      sec.id === selectedSectionId
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold flex items-center space-x-2">
                        <span className="text-slate-400 text-[10px]">#{idx + 1}</span>
                        <span>{sec.title}</span>
                      </span>
                      <div className="flex items-center space-x-1">
                        <button onClick={(e) => { e.stopPropagation(); moveSectionUp(sec.id); }} className="p-1 text-slate-400 hover:text-blue-600">
                          <Icon name="arrowUp" className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveSectionDown(sec.id); }} className="p-1 text-slate-400 hover:text-blue-600">
                          <Icon name="arrowDown" className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }} className="p-1 text-slate-400 hover:text-red-600">
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {sec.blocks.length} blocks | Height: {getSectionHeight(sec, viewport)}px
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === "templates" && <TemplateSelector />}
        {activeTab === "settings" && <PageSettings />}
      </div>
    </div>
  );
}
