"use client";

import type { Element } from "../lib/block-types";

const VARIANTS = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
] as const;

const SIZES = [
  { value: 'sm', label: 'Small', fontSize: '12px', padding: '6px 12px' },
  { value: 'md', label: 'Medium', fontSize: '14px', padding: '10px 20px' },
  { value: 'lg', label: 'Large', fontSize: '16px', padding: '14px 28px' },
] as const;

export function ButtonInspector({
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
      {/* Label */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Button Label</label>
        <input
          type="text"
          value={element.text || ''}
          onChange={(e) => update({ text: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
        />
      </div>

      {/* Variant */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Variant</label>
        <div className="grid grid-cols-2 gap-1.5">
          {VARIANTS.map((v) => (
            <button
              key={v.value}
              onClick={() => update({ variant: v.value })}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                (element.variant || 'primary') === v.value
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Size</label>
        <div className="grid grid-cols-3 gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ size: s.value, fontSize: s.fontSize, padding: s.padding })}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                (element.size || 'md') === s.value
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Color */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Text Color</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={element.textColor || '#ffffff'}
            onChange={(e) => update({ textColor: e.target.value })}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
          />
          <span className="font-mono text-[11px] text-slate-600">{element.textColor}</span>
        </div>
      </div>

      {/* Background Color */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Background</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={element.bgColor || '#2563eb'}
            onChange={(e) => update({ bgColor: e.target.value })}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
          />
          <span className="font-mono text-[11px] text-slate-600">{element.bgColor}</span>
        </div>
      </div>

      {/* Border Color */}
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

      {/* Border Radius */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Border Radius</label>
        <input
          type="text"
          value={element.borderRadius || '12px'}
          onChange={(e) => update({ borderRadius: e.target.value })}
          placeholder="e.g., 12px, 9999px"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
        />
      </div>

      {/* Padding */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Padding</label>
        <input
          type="text"
          value={element.padding || '12px 24px'}
          onChange={(e) => update({ padding: e.target.value })}
          placeholder="e.g., 12px 24px"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
        />
      </div>

      {/* URL */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Link URL</label>
        <input
          type="text"
          value={element.url || '#'}
          onChange={(e) => update({ url: e.target.value })}
          placeholder="https://..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
        />
      </div>

      {/* Open in new tab */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Open in New Tab</label>
        <input
          type="checkbox"
          checked={!!element.openInNewTab}
          onChange={(e) => update({ openInNewTab: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
