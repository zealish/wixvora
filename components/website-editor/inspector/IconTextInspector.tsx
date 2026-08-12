"use client";

import type { Element } from "../lib/block-types";
import { t } from "../lib/translations";

const ICON_OPTIONS = [
  { label: 'Star', value: 'star' },
  { label: 'Check', value: 'check' },
  { label: 'Settings', value: 'settings' },
  { label: 'Mail', value: 'mail' },
  { label: 'Sparkles', value: 'sparkles' },
];

export function IconTextInspector({
  element,
  sectionId,
  onUpdate,
}: {
  element: Element;
  sectionId: string;
  onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void;
}) {
  const update = (props: Partial<Element>) => onUpdate(sectionId, element.id, props);

  return (
    <div className="space-y-4">
      <div className="space-y-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('inspector.icon_text.icon')}</label>

        <div className="space-y-1">
          <label className="text-[9px] text-slate-400">Icon</label>
          <select
            value={element.iconName || 'star'}
            onChange={(e) => update({ iconName: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
          >
            {ICON_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[9px] text-slate-400">{t('inspector.icon_text.icon_color')}</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.iconColor || '#3b82f6'}
              onChange={(e) => update({ iconColor: e.target.value })}
              className="w-6 h-6 rounded border border-slate-200 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-[10px] text-slate-600">{element.iconColor}</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-slate-400">{t('inspector.icon_text.icon_size')}</label>
          <select
            value={element.iconSize || '32'}
            onChange={(e) => update({ iconSize: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
          >
            {['24', '32', '40', '48'].map(v => (
              <option key={v} value={v}>{v}px</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Content</label>

        <div className="space-y-1">
          <label className="text-[9px] text-slate-400">Title</label>
          <input
            type="text"
            value={element.title || ''}
            onChange={(e) => update({ title: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-slate-400">Description</label>
          <input
            type="text"
            value={element.subtitle || ''}
            onChange={(e) => update({ subtitle: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[9px] text-slate-400">Title Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.textColor || '#0f172a'}
              onChange={(e) => update({ textColor: e.target.value })}
              className="w-6 h-6 rounded border border-slate-200 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-[10px] text-slate-600">{element.textColor}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[9px] text-slate-400">{t('inspector.icon_text.description_color')}</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value="#6b7280"
              onChange={(e) => update({ accentColor: e.target.value })}
              className="w-6 h-6 rounded border border-slate-200 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-[10px] text-slate-600">#6b7280</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('inspector.icon_text.layout')}</label>

        <div className="grid grid-cols-2 gap-1">
          {(['horizontal', 'vertical'] as const).map(layout => (
            <button
              key={layout}
              onClick={() => update({ iconTextLayout: layout })}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition ${(element.iconTextLayout || 'horizontal') === layout ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
            >
              {layout === 'horizontal' ? 'Horizontal' : 'Vertical'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
