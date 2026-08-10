"use client";

import { useState } from "react";
import { Icon } from "../ui/icon-library";
import { useEditor } from "../editor-provider";
import { ContentTab } from "./content-tab";
import { StyleTab } from "./style-tab";
import { GridTab } from "./grid-tab";
import { getLayout } from "../lib/viewport-utils";

const TABS = ["Konten", "Tampilan", "Kolom / Grid", "Posisi"] as const;

type Tab = (typeof TABS)[number];

export function RightInspector() {
  const { activeBlock, isPreviewMode, selectedBlockId, viewport, findBlock, updateBlockLayout } = useEditor();
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
        {activeTab === "Posisi" && selectedBlockId && (() => {
          const result = findBlock(selectedBlockId);
          if (!result) return null;
          
          const { section, block } = result;
          const layout = getLayout(block, viewport);
          
          return (
            <div className="space-y-4 p-4">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-700 leading-relaxed">
                Position changes only apply to <strong>{viewport.toUpperCase()}</strong> viewport.
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">X Position</label>
                  <input
                    type="number"
                    value={layout.x}
                    onChange={(e) => {
                      updateBlockLayout(section.id, block.id, viewport, { x: parseInt(e.target.value) || 0 });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Y Position</label>
                  <input
                    type="number"
                    value={layout.y}
                    onChange={(e) => {
                      updateBlockLayout(section.id, block.id, viewport, { y: parseInt(e.target.value) || 0 });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Width</label>
                  <input
                    type="number"
                    value={layout.width}
                    onChange={(e) => {
                      updateBlockLayout(section.id, block.id, viewport, { width: Math.max(30, parseInt(e.target.value) || 30) });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Height</label>
                  <input
                    type="number"
                    value={layout.height}
                    onChange={(e) => {
                      updateBlockLayout(section.id, block.id, viewport, { height: Math.max(20, parseInt(e.target.value) || 20) });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">Hide on {viewport.toUpperCase()}</span>
                <input
                  type="checkbox"
                  checked={layout.hidden}
                  onChange={(e) => {
                    updateBlockLayout(section.id, block.id, viewport, { hidden: e.target.checked });
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
