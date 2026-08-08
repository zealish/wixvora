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
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/90 px-4 backdrop-blur-md select-none">
      <div className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="hidden lg:block">
          <h2 className="text-sm leading-tight font-bold text-white">
            Block Editor
          </h2>
          <p className="text-[10px] text-slate-400">
            Wix & WordPress style builder
          </p>
        </div>
      </div>

      <ViewportSwitcher viewport={viewport} onChange={onViewportChange} />

      <div className="flex items-center space-x-2">
        <div className="mr-1 flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="rounded p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-30"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="rounded p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-30"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <label className="flex cursor-pointer items-center space-x-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700">
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
          className="flex items-center space-x-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
        >
          Export JSON
        </button>

        <button
          type="button"
          onClick={onTogglePreview}
          className={`flex items-center space-x-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
            isPreviewMode
              ? "border-amber-500/30 bg-amber-500/20 text-amber-400"
              : "border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          {isPreviewMode ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {isPreviewMode ? "Exit Preview" : "Preview"}
          </span>
        </button>

        <button
          type="button"
          onClick={onExportHTML}
          className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500"
        >
          <Code className="h-4 w-4" />
          <span>Export HTML</span>
        </button>
      </div>
    </header>
  );
}
