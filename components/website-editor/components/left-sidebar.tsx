"use client";

import { useRef, useEffect } from "react";
import { Icon } from "../ui/icon-library";
import { t } from "../lib/translations";
import { useEditor } from "../editor-provider";

type FlyoutType = 'elements' | 'sections_list' | 'pages' | null;

interface LeftSidebarProps {
  addMenuOpen: boolean;
  setAddMenuOpen: (v: boolean) => void;
  activeFlyout: FlyoutType;
  setActiveFlyout: (v: FlyoutType) => void;
  setIsElementModalOpen: (v: boolean) => void;
  setIsSectionModalOpen: (v: boolean) => void;
}

export function LeftSidebar({
  addMenuOpen, setAddMenuOpen, activeFlyout, setActiveFlyout,
  setIsElementModalOpen, setIsSectionModalOpen,
}: LeftSidebarProps) {
  const { isPreviewMode } = useEditor();
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setAddMenuOpen]);

  if (isPreviewMode) return null;

  return (
    <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-3 z-30 shrink-0 select-none justify-between relative shadow-sm">
      <div className="flex flex-col items-center space-y-4 w-full px-2" ref={addMenuRef}>

        <a
          href="/staff/templates"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200"
          title="Back to Template List"
        >
          <Icon name="arrowUp" className="w-4 h-4 rotate-[-90deg]" />
        </a>

        <div className="relative w-full flex justify-center">
          <button
            onClick={() => setAddMenuOpen(!addMenuOpen)}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition-all shadow-md ${addMenuOpen ? 'bg-blue-600 text-white scale-105 ring-4 ring-blue-500/20' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-blue-500/20'}`}
            title="Add Element, Section, Page"
          >
            <Icon name="plus" className="w-6 h-6" />
          </button>

          {addMenuOpen && (
            <div className="absolute left-16 top-0 w-64 bg-white/98 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-slate-700 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Add to Website (Wix Style)
              </div>

              <button
                onClick={() => { setIsElementModalOpen(true); setAddMenuOpen(false); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-left transition group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Icon name="sparkles" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">New Element</div>
                    <div className="text-[10px] text-slate-400">Text, Button, Image, Card</div>
                  </div>
                </div>
                <Icon name="chevronRight" className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { setIsSectionModalOpen(true); setAddMenuOpen(false); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 text-left transition group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Icon name="layout" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Section Template</div>
                    <div className="text-[10px] text-slate-400">Choose from section templates</div>
                  </div>
                </div>
                <Icon name="chevronRight" className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => { setActiveFlyout('pages'); setAddMenuOpen(false); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-600 text-left transition group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                    <Icon name="page" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Manage Pages</div>
                    <div className="text-[10px] text-slate-400">Home, About, Contact</div>
                  </div>
                </div>
                <Icon name="chevronRight" className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 w-full pt-2 border-t border-slate-200">
          <button
            onClick={() => setIsElementModalOpen(true)}
            className="w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition text-[10px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            title={t('sidebar.elements')}
          >
            <Icon name="sparkles" className="w-4 h-4 mb-0.5" />
            <span>{t('sidebar.elements')}</span>
          </button>

          <button
            onClick={() => setActiveFlyout(activeFlyout === 'sections_list' ? null : 'sections_list')}
            className={`w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition text-[10px] font-semibold ${activeFlyout === 'sections_list' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            title={t('sidebar.sections')}
          >
            <Icon name="layers" className="w-4 h-4 mb-0.5" />
            <span>{t('sidebar.sections')}</span>
          </button>

          <button
            onClick={() => setActiveFlyout(activeFlyout === 'pages' ? null : 'pages')}
            className={`w-full py-2.5 rounded-xl flex flex-col items-center justify-center transition text-[10px] font-semibold ${activeFlyout === 'pages' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            title={t('sidebar.pages')}
          >
            <Icon name="page" className="w-4 h-4 mb-0.5" />
            <span>{t('sidebar.pages')}</span>
          </button>
        </div>
      </div>

      <div className="text-[9px] text-slate-400 font-bold tracking-widest text-center uppercase">
        Wix UI
      </div>
    </aside>
  );
}
