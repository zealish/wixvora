"use client";

import { useState } from "react";
import { Icon } from "../ui/icon-library";
import { useEditor } from "../editor-provider";
import { ContentTab } from "./content-tab";
import { StyleTab } from "./style-tab";
import { GridTab } from "./grid-tab";

const TABS = ["Konten", "Tampilan", "Kolom / Grid"] as const;

type Tab = (typeof TABS)[number];

export function RightInspector() {
  const { activeBlock, isPreviewMode } = useEditor();
  const [activeTab, setActiveTab] = useState<Tab>("Konten");

  if (!activeBlock || isPreviewMode) return null;

  return (
    <div className="flex h-full w-80 flex-col border-l border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Inspector Layer</h3>
        <Icon name="edit" size={16} className="text-slate-400" />
      </div>

      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "Konten" && <ContentTab />}
        {activeTab === "Tampilan" && <StyleTab />}
        {activeTab === "Kolom / Grid" && <GridTab />}
      </div>
    </div>
  );
}
