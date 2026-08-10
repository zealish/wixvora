"use client";

import { useState } from "react";
import { useEditor } from "../editor-provider";
import { getLayout } from "../lib/viewport-utils";

type Tab = "position" | "style";

export function RightInspector() {
  const {
    activeBlock,
    isPreviewMode,
    selectedBlockId,
    viewport,
    sections,
    findBlock,
    updateBlockLayout,
    updateBlockProps,
  } = useEditor();
  const [activeTab, setActiveTab] = useState<Tab>("position");

  if (!activeBlock || isPreviewMode || !selectedBlockId) return null;

  const result = findBlock(selectedBlockId);
  const block = activeBlock;
  const layout = getLayout(block, viewport);
  const props = block.props || {};

  // Find the section containing this block (search recursively)
  const findSectionForBlock = (blockId: string) => {
    for (const sec of sections) {
      if (sec.blocks.some(b => b.id === blockId)) return sec;
      // Also search nested blocks
      for (const b of sec.blocks) {
        if (b.children) {
          const found = b.children.some(child => child.id === blockId);
          if (found) return sec;
        }
      }
    }
    return null;
  };

  const section = result?.section || findSectionForBlock(selectedBlockId);

  if (!section) return null;

  return (
    <div className="flex h-full w-80 flex-col border-l border-slate-200 bg-white">
      <div className="grid grid-cols-2 border-b border-slate-200 text-[11px] bg-slate-50">
        <button
          onClick={() => setActiveTab("position")}
          className={`py-2 font-semibold transition ${
            activeTab === "position"
              ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Posisi [{viewport.toUpperCase()}]
        </button>
        <button
          onClick={() => setActiveTab("style")}
          className={`py-2 font-semibold transition ${
            activeTab === "style"
              ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Style & Konten
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700">
        {activeTab === "position" && (
          <div className="space-y-4">
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-700 leading-relaxed">
              📌 Perubahan posisi X, Y & ukuran <strong>hanya berlaku untuk mode {viewport.toUpperCase()}</strong>.
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Posisi X (Kiri)</label>
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
                <label className="text-[10px] font-bold text-slate-500">Posisi Y (Atas)</label>
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
                <label className="text-[10px] font-bold text-slate-500">Lebar (Width)</label>
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
                <label className="text-[10px] font-bold text-slate-500">Tinggi (Height)</label>
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
              <span className="text-[11px] font-semibold text-slate-600">Sembunyikan di {viewport.toUpperCase()}</span>
              <input
                type="checkbox"
                checked={!!layout.hidden}
                onChange={(e) => {
                  updateBlockLayout(section.id, block.id, viewport, { hidden: e.target.checked });
                }}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {activeTab === "style" && (
          <div className="space-y-4">
            {(block.type === "heading" || block.type === "paragraph" || block.type === "button" || block.type === "badge") && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Teks Konten</label>
                <textarea
                  rows={3}
                  value={props.text || ""}
                  onChange={(e) => updateBlockProps({ text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            )}

            {block.type === "card" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Judul Kartu</label>
                  <input
                    type="text"
                    value={props.title || ""}
                    onChange={(e) => updateBlockProps({ title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">Sub-deskripsi Kartu</label>
                  <textarea
                    rows={3}
                    value={props.subtitle || ""}
                    onChange={(e) => updateBlockProps({ subtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {block.type === "image" && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">URL Gambar (URL)</label>
                <input
                  type="text"
                  value={props.src || ""}
                  onChange={(e) => updateBlockProps({ src: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>
            )}

            {props.textColor !== undefined && (
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500">Warna Teks</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={props.textColor || "#000000"}
                    onChange={(e) => updateBlockProps({ textColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-slate-600">{props.textColor}</span>
                </div>
              </div>
            )}

            {props.bgColor !== undefined && (
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500">Warna Background</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={props.bgColor || "#ffffff"}
                    onChange={(e) => updateBlockProps({ bgColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-slate-600">{props.bgColor}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
