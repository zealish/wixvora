"use client";

import type { Element } from "../lib/block-types";

const FONT_SIZE_OPTIONS = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
];

const FONT_WEIGHT_OPTIONS = [
  { label: '400', value: '400' },
  { label: '500', value: '500' },
  { label: '600', value: '600' },
  { label: '700', value: '700' },
  { label: '800', value: '800' },
];

export function CardInspector({
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
      {/* Card Title Section */}
      <div className="space-y-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</label>

        <div className="space-y-1">
          <label className="text-[9px] text-slate-400">Text</label>
          <input
            type="text"
            value={element.title || ''}
            onChange={(e) => update({ title: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400">Font Size</label>
            <select
              value={element.titleFontSize || '18px'}
              onChange={(e) => update({ titleFontSize: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
            >
              {FONT_SIZE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400">Font Weight</label>
            <select
              value={element.titleFontWeight || '700'}
              onChange={(e) => update({ titleFontWeight: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
            >
              {FONT_WEIGHT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[9px] text-slate-400">Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.titleColor || '#2563eb'}
              onChange={(e) => update({ titleColor: e.target.value })}
              className="w-6 h-6 rounded border border-slate-200 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-[10px] text-slate-600">{element.titleColor}</span>
          </div>
        </div>
      </div>

      {/* Card Subtitle Section */}
      <div className="space-y-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subtitle</label>

        <div className="space-y-1">
          <label className="text-[9px] text-slate-400">Text</label>
          <input
            type="text"
            value={element.subtitle || ''}
            onChange={(e) => update({ subtitle: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400">Font Size</label>
            <select
              value={element.subtitleFontSize || '13px'}
              onChange={(e) => update({ subtitleFontSize: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
            >
              {FONT_SIZE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400">Font Weight</label>
            <select
              value={element.subtitleFontWeight || '400'}
              onChange={(e) => update({ subtitleFontWeight: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
            >
              {FONT_WEIGHT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[9px] text-slate-400">Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.subtitleColor || '#64748b'}
              onChange={(e) => update({ subtitleColor: e.target.value })}
              className="w-6 h-6 rounded border border-slate-200 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-[10px] text-slate-600">{element.subtitleColor}</span>
          </div>
        </div>
      </div>

      {/* Card Style Section */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Card Style</label>

        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-500">Background</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.bgColor || '#ffffff'}
              onChange={(e) => update({ bgColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-[11px] text-slate-600">{element.bgColor}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-500">Border Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.borderColor || '#e2e8f0'}
              onChange={(e) => update({ borderColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-[11px] text-slate-600">{element.borderColor}</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Border Radius</label>
          <input
            type="text"
            value={element.borderRadius || '16px'}
            onChange={(e) => update({ borderRadius: e.target.value })}
            placeholder="e.g., 16px"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
          />
        </div>
      </div>
    </div>
  );
}
