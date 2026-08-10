"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor } from "../editor-provider";
import { Icon } from "../ui/icon-library";
import { ELEMENT_PRESETS } from "../lib/element-presets";
import { getSectionHeight } from "../lib/viewport-utils";

type FlyoutPanel = "elements" | "sections" | "pages" | null;

export function LeftSidebar() {
  const {
    isPreviewMode,
    sections,
    selectedSectionId,
    selectSection,
    moveSectionUp,
    moveSectionDown,
    deleteSection,
    viewport,
    addElementFromPreset,
  } = useEditor();

  const [activeFlyout, setActiveFlyout] = useState<FlyoutPanel>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setActiveFlyout(null);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isPreviewMode) return null;

  const toggleFlyout = (panel: FlyoutPanel) => {
    setActiveFlyout((prev) => (prev === panel ? null : panel));
    setShowAddMenu(false);
  };

  return (
    <div className="relative flex h-full">
      {/* 64px Icon Bar */}
      <div className="flex w-16 flex-col items-center border-r border-slate-200 bg-white py-2">
        {/* + Button */}
        <div className="relative mb-1" ref={addMenuRef}>
          <button
            onClick={() => setShowAddMenu((prev) => !prev)}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500"
          >
            <Icon name="plus" size={24} />
          </button>
          {showAddMenu && (
            <div className="absolute left-full top-0 ml-2 w-52 rounded-xl border border-slate-200 bg-white shadow-xl z-50">
              <div className="p-1.5">
                <button
                  onClick={() => {
                    setActiveFlyout("elements");
                    setShowAddMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Icon name="plus" size={18} className="text-slate-400" />
                  <span className="font-medium">Elemen Baru</span>
                  <Icon name="chevronRight" size={16} className="ml-auto text-slate-300" />
                </button>
                <button
                  onClick={() => {
                    setActiveFlyout("sections");
                    setShowAddMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Icon name="layout" size={18} className="text-slate-400" />
                  <span className="font-medium">Seksi Templat</span>
                  <Icon name="chevronRight" size={16} className="ml-auto text-slate-300" />
                </button>
                <button
                  onClick={() => {
                    setActiveFlyout("pages");
                    setShowAddMenu(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Icon name="settings" size={18} className="text-slate-400" />
                  <span className="font-medium">Kelola Halaman</span>
                  <Icon name="chevronRight" size={16} className="ml-auto text-slate-300" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-px w-8 bg-slate-200 my-1" />

        {/* Tab Icons */}
        <button
          onClick={() => toggleFlyout("elements")}
          className={`mb-1 flex h-12 w-12 items-center justify-center rounded-xl transition ${
            activeFlyout === "elements"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
          title="Elemen"
        >
          <Icon name="plus" size={20} />
        </button>

        <button
          onClick={() => toggleFlyout("sections")}
          className={`mb-1 flex h-12 w-12 items-center justify-center rounded-xl transition ${
            activeFlyout === "sections"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
          title="Seksi"
        >
          <Icon name="layout" size={20} />
        </button>

        <button
          onClick={() => toggleFlyout("pages")}
          className={`mb-1 flex h-12 w-12 items-center justify-center rounded-xl transition ${
            activeFlyout === "pages"
              ? "bg-blue-50 text-blue-600"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
          title="Halaman"
        >
          <Icon name="layers" size={20} />
        </button>
      </div>

      {/* Flyout Panel */}
      {activeFlyout && (
        <div
          ref={flyoutRef}
          className="flex h-full w-72 flex-col border-r border-slate-200 bg-white"
        >
          {/* Elements Flyout */}
          {activeFlyout === "elements" && (
            <>
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-bold text-slate-900">Elemen</h3>
                <p className="text-[11px] text-slate-500">Drag atau klik untuk menambahkan</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-1.5">
                  {ELEMENT_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        addElementFromPreset(index);
                        setActiveFlyout(null);
                      }}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                        <Icon name={preset.icon as any} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-slate-700 truncate">
                          {preset.label}
                        </div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {preset.type}
                        </div>
                      </div>
                      <Icon name="plus" size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Sections Flyout */}
          {activeFlyout === "sections" && (
            <>
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-bold text-slate-900">Seksi</h3>
                <p className="text-[11px] text-slate-500">{sections.length} seksi aktif</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    onClick={() => selectSection(sec.id)}
                    className={`rounded-xl border p-3 text-xs cursor-pointer transition ${
                      sec.id === selectedSectionId
                        ? "border-blue-300 bg-blue-50 text-blue-900 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                        <span className="font-bold truncate">{sec.title}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSectionUp(sec.id); }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Move Up"
                        >
                          <Icon name="arrowUp" size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveSectionDown(sec.id); }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Move Down"
                        >
                          <Icon name="arrowDown" size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {sec.blocks.length} blocks · {getSectionHeight(sec, viewport)}px
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 p-3">
                <button
                  onClick={() => {
                    setActiveFlyout(null);
                    // Trigger section template modal
                    const event = new CustomEvent("open-section-templates");
                    window.dispatchEvent(event);
                  }}
                  className="w-full rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 flex items-center justify-center gap-2"
                >
                  <Icon name="plus" size={16} />
                  <span>Add Section Template</span>
                </button>
              </div>
            </>
          )}

          {/* Pages Flyout */}
          {activeFlyout === "pages" && (
            <>
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-bold text-slate-900">Halaman</h3>
                <p className="text-[11px] text-slate-500">Kelola halaman website</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="layers" size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">index</span>
                  </div>
                  <div className="text-[11px] text-blue-700">
                    {sections.length} sections · {sections.reduce((acc, s) => acc + s.blocks.length, 0)} blocks
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 opacity-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="plus" size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-500">+ Tambah Halaman Baru</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Coming soon</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
