"use client";

import { Icon } from "../ui/icon-library";
import type { Viewport } from "../lib/block-types";
import { t } from "../lib/translations";
import { useEditor } from "../editor-provider";

export function Topbar({ backUrl, title }: { backUrl?: string | undefined; title?: string | undefined }) {
  const {
    viewport, isPreviewMode, snapToGrid, canUndo, canRedo, isSaving,
    setViewport, setIsPreviewMode, setSnapToGrid, undo, redo, saveWebsite,
  } = useEditor();

  return (
    <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-sm">
      <div className="flex items-center space-x-3">
        {backUrl && (
          <a href={backUrl} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition" title="Back">
            <Icon name="arrowLeft" className="w-4 h-4 text-slate-600" />
          </a>
        )}
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
          <Icon name="sparkles" className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <h1 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-2">
            {title || 'WebCraft Studio'}
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-widest">WIX-STYLE DnD</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 space-x-1">
        {(['desktop', 'tablet', 'mobile'] as Viewport[]).map(vp => (
          <button key={vp} onClick={() => setViewport(vp)} className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${viewport === vp ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            <Icon name={vp} className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{vp === 'desktop' ? t('viewport.desktop') : vp === 'tablet' ? t('viewport.tablet') : t('viewport.mobile')}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <button onClick={() => setSnapToGrid(!snapToGrid)} className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1 ${snapToGrid ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`} title="Snap Grid">
          <Icon name="grid" className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Snap</span>
        </button>

        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
          <button onClick={undo} disabled={!canUndo} className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition" title={t('editor.undo')}><Icon name="undo" className="w-3.5 h-3.5" /></button>
          <button onClick={redo} disabled={!canRedo} className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition" title={t('editor.redo')}><Icon name="redo" className="w-3.5 h-3.5" /></button>
        </div>

        <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${isPreviewMode ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
          <Icon name={isPreviewMode ? 'eyeOff' : 'eye'} className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isPreviewMode ? 'Exit Preview' : t('editor.preview')}</span>
        </button>

        <button
          onClick={saveWebsite}
          disabled={isSaving}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition disabled:opacity-50"
        >
          <Icon name="download" className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : t('editor.save')}</span>
        </button>
      </div>
    </header>
  );
}
