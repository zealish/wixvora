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
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Icon name="sparkles" size={18} className="text-white" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 hidden sm:block">
          WebCraft Studio
        </h1>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md hidden sm:block">
          LIGHT PRO
        </span>
      </div>

      <div className="flex items-center gap-2">
        <ViewportSwitcher />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo"
        >
          <Icon name="undo" size={18} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo"
        >
          <Icon name="redo" size={18} />
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Icon name="upload" size={16} />
          <span className="hidden md:inline">Import JSON</span>
        </button>
        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Icon name="download" size={16} />
          <span className="hidden md:inline">Export JSON</span>
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Icon name="code" size={16} />
          <span className="hidden md:inline">Export HTML</span>
        </button>
      </div>
    </header>
  );
}
