"use client";

import { Icon } from "../ui/icon-library";
import { t } from "../lib/translations";
import { useEditor } from "../editor-provider";
import { getSectionHeight } from "../lib/viewport-utils";

type FlyoutType = 'elements' | 'sections_list' | 'pages' | null;

interface FlyoutPanelProps {
  activeFlyout: FlyoutType & string;
  setActiveFlyout: (v: FlyoutType) => void;
  setIsSectionModalOpen: (v: boolean) => void;
}

export function FlyoutPanel({ activeFlyout, setActiveFlyout, setIsSectionModalOpen }: FlyoutPanelProps) {
  const {
    sections, selectedSectionId, viewport, pages,
    selectSection, deleteSection, moveSection, addPage,
  } = useEditor();

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 select-none shadow-lg">
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          {activeFlyout === 'sections_list' && <><Icon name="layers" className="w-4 h-4 text-emerald-600" /><span>{t('flyout.struktur_seksi')} ({sections.length})</span></>}
          {activeFlyout === 'pages' && <><Icon name="page" className="w-4 h-4 text-amber-600" /><span>{t('flyout.halaman_website')}</span></>}
        </h3>
        <button onClick={() => setActiveFlyout(null)} className="text-slate-400 hover:text-slate-700"><Icon name="x" className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeFlyout === 'sections_list' && (
          <div className="space-y-2">
            <button
              onClick={() => { setIsSectionModalOpen(true); setActiveFlyout(null); }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Icon name="plus" className="w-4 h-4" />
              <span>{t('misc.add_section_template')}</span>
            </button>

            <div className="space-y-2 pt-2">
              {sections.map((sec, idx) => (
                <div key={sec.id} onClick={() => { selectSection(sec.id); setActiveFlyout(null); }} className={`p-3 rounded-xl border text-xs cursor-pointer transition ${sec.id === selectedSectionId ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold flex items-center space-x-2">
                      <span className="text-slate-400 text-[10px]">#{idx + 1}</span>
                      <span>{sec.title}</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      <button onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'up'); }} className="p-1 text-slate-400 hover:text-blue-600" title={t('misc.move_up')}><Icon name="arrowUp" className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'down'); }} className="p-1 text-slate-400 hover:text-blue-600" title={t('misc.move_down')}><Icon name="arrowDown" className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }} className="p-1 text-slate-400 hover:text-red-600" title={t('misc.delete')}><Icon name="trash" className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{sec.elements.length} {t('misc.element')}</span>
                    <span>Height: {getSectionHeight(sec, viewport)}px</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeFlyout === 'pages' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-500">Your Site Page Structure:</div>
            {pages.map(page => (
              <div key={page.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center space-x-2">
                  <Icon name="page" className="w-4 h-4 text-amber-600" />
                  <span>{page.title}</span>
                </span>
                {page.isHomePage && <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold">HOME</span>}
              </div>
            ))}
            <button onClick={() => { const count = pages.length + 1; addPage(`Page ${count}`); }} className="w-full py-2 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-xs text-slate-600 flex items-center justify-center space-x-1">
              <Icon name="plus" className="w-3.5 h-3.5" />
              <span>+ New Page</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
