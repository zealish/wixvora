"use client";

import { Undo, Redo, Eye, EyeOff, Code, Sparkles } from "lucide-react";
import { ViewportSwitcher } from "./viewport-switcher";
import type { Viewport } from "./hooks/use-block-editor";

interface EditorToolbarProps {
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onExportHTML: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
}

export function EditorToolbar({
  viewport,
  onViewportChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isPreviewMode,
  onTogglePreview,
  onExportHTML,
  onExportJSON,
  onImportJSON,
}: EditorToolbarProps) {
  return (
    <header className="h-14 shrink-0 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 select-none">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="hidden lg:block">
          <h2 className="font-bold text-sm text-white leading-tight">Block Editor</h2>
          <p className="text-[10px] text-slate-400">Wix & WordPress style builder</p>
        </div>
      </div>

      <ViewportSwitcher viewport={viewport} onChange={onViewportChange} />

      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1 mr-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        <label className="cursor-pointer px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1 transition">
          Import JSON
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportJSON(file);
              e.target.value = "";
            }}
          />
        </label>

        <button
          type="button"
          onClick={onExportJSON}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1 transition"
        >
          Export JSON
        </button>

        <button
          type="button"
          onClick={onTogglePreview}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
            isPreviewMode
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
          }`}
        >
          {isPreviewMode ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isPreviewMode ? "Exit Preview" : "Preview"}
          </span>
        </button>

        <button
          type="button"
          onClick={onExportHTML}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition"
        >
          <Code className="w-4 h-4" />
          <span>Export HTML</span>
        </button>
      </div>
    </header>
  );
}
