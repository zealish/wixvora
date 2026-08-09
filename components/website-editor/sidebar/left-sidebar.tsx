"use client";

import { useEditor } from "../editor-provider";
import { BlockPalette } from "./block-palette";
import { LayerManager } from "./layer-manager";
import { TemplateSelector } from "./template-selector";
import { PageSettings } from "./page-settings";
import { Icon } from "../ui/icon-library";

const tabs = [
  { id: "blocks" as const, label: "Tambah", icon: "plus" as const },
  { id: "layers" as const, label: "Layer", icon: "layers" as const },
  { id: "templates" as const, label: "Template", icon: "layout" as const },
  { id: "settings" as const, label: "Halaman", icon: "settings" as const },
];

export function LeftSidebar() {
  const { activeTab, setActiveTab, isPreviewMode } = useEditor();

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
        {activeTab === "layers" && <LayerManager />}
        {activeTab === "templates" && <TemplateSelector />}
        {activeTab === "settings" && <PageSettings />}
      </div>
    </div>
  );
}
