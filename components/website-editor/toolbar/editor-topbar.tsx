"use client";

import { useRef } from "react";
import { useEditor } from "../editor-provider";
import { Icon } from "../ui/icon-library";
import { ViewportSwitcher } from "./viewport-switcher";

export function EditorTopbar() {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    importJSON,
    exportJSON,
    isPreviewMode,
    setIsPreviewMode,
    setShowExportModal,
    zoom,
    setZoom,
  } = useEditor();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importJSON(json);
      } catch {
        console.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportJSON = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website-project.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <Icon name="sparkles" size={18} className="text-white" />
        </div>
        <h1 className="hidden text-lg font-bold text-slate-900 sm:block">
          Wixvora Studio
        </h1>
        {/* <span className="hidden rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 sm:block">
          LIGHT PRO
        </span> */}
      </div>

      <div className="flex items-center gap-2">
        <ViewportSwitcher />
        
        <div className="mx-2 h-6 w-px bg-slate-200" />
        
        <button
          onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          title="Zoom out"
        >
          <Icon name="minus" size={18} />
        </button>
        
        <div className="min-w-[3rem] text-center text-sm font-medium text-slate-700">
          {Math.round(zoom * 100)}%
        </div>
        
        <button
          onClick={() => setZoom(Math.min(4, zoom + 0.1))}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          title="Zoom in"
        >
          <Icon name="plus" size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
          title="Undo"
        >
          <Icon name="undo" size={18} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
          title="Redo"
        >
          <Icon name="redo" size={18} />
        </button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Icon name="upload" size={16} />
          <span className="hidden md:inline">Import JSON</span>
        </button>
        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Icon name="download" size={16} />
          <span className="hidden md:inline">Export JSON</span>
        </button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            isPreviewMode
              ? "bg-blue-100 text-blue-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Icon name={isPreviewMode ? "eyeOff" : "eye"} size={16} />
          <span className="hidden md:inline">Preview</span>
        </button>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Icon name="code" size={16} />
          <span className="hidden md:inline">Export HTML</span>
        </button>
      </div>
    </header>
  );
}
