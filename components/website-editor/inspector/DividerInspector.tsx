"use client";

import type { Element } from "../lib/block-types";
import { t } from "../lib/translations";

export function DividerInspector({
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">{t('inspector.divider.color')}</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={element.dividerColor || '#e5e7eb'}
            onChange={(e) => update({ dividerColor: e.target.value })}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
          />
          <span className="font-mono text-[11px] text-slate-600">{element.dividerColor}</span>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">{t('inspector.divider.height')}</label>
        <select
          value={element.dividerHeight || '1px'}
          onChange={(e) => update({ dividerHeight: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
        >
          {['1px', '2px', '3px', '4px'].map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">{t('inspector.divider.width')}</label>
        <select
          value={element.dividerWidth || '100%'}
          onChange={(e) => update({ dividerWidth: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
        >
          {['100%', '75%', '50%', '25%'].map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
