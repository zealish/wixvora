"use client";

import { Icon } from "../ui/icon-library";
import { t } from "../lib/translations";
import { useEditor } from "../editor-provider";

interface SectionTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SectionTemplatesModal({ isOpen, onClose }: SectionTemplatesModalProps) {
  const { addSectionFromTemplate } = useEditor();

  if (!isOpen) return null;

  const { SECTION_TEMPLATES } = require('../lib/section-templates');

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{t('sections.modal.title')} (Wix Sections)</h2>
            <p className="text-xs text-slate-500">{t('sections.modal.subtitle')}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"><Icon name="x" className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTION_TEMPLATES.map((tmpl: any) => (
            <div key={tmpl.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition bg-white group" style={{ minHeight: '200px' }}>
              <div className="p-4 flex flex-col">
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 mb-2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">{tmpl.category}</span>
                  <h3 className="font-extrabold text-sm text-slate-900 mb-1">{tmpl.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-h-16 overflow-hidden">{tmpl.desc}</p>
                </div>
                <button
                  onClick={() => addSectionFromTemplate(tmpl.id)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 flex-shrink-0 mt-auto"
                >
                  <span>+</span>
                  <span>Add This Section</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
