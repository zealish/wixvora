"use client";

import type { Element } from "../lib/block-types";

const BADGE_VARIANTS = [
  { value: 'solid', label: 'Solid' },
  { value: 'outline', label: 'Outline' },
  { value: 'dot', label: 'Dot' },
] as const;

const BADGE_SIZES = [
  { value: 'sm', label: 'Small', fontSize: '10px' },
  { value: 'md', label: 'Medium', fontSize: '12px' },
] as const;

export function BadgeInspector({
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
        <label className="text-[10px] font-bold text-slate-500">Badge Label</label>
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
        <div className="grid grid-cols-3 gap-1.5">
          {BADGE_VARIANTS.map((v) => (
            <button
              key={v.value}
              onClick={() => update({ badgeVariant: v.value })}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                (element.badgeVariant || 'solid') === v.value
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
        <div className="grid grid-cols-2 gap-1.5">
          {BADGE_SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ size: s.value, fontSize: s.fontSize })}
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
            value={element.textColor || '#2563eb'}
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
            value={element.bgColor || '#eff6ff'}
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
            value={element.borderColor || '#bfdbfe'}
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
          value={element.borderRadius || '9999px'}
          onChange={(e) => update({ borderRadius: e.target.value })}
          placeholder="e.g., 9999px, 8px"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
        />
      </div>
    </div>
  );
}
