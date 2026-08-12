"use client";

import type { Element } from "../lib/block-types";

const OBJECT_FITS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'scale-down', label: 'Scale-down' },
] as const;

const ASPECT_RATIOS = [
  { value: '', label: 'Auto' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
] as const;

const HOVER_EFFECTS = [
  { value: 'none' as const, label: 'None' },
  { value: 'zoom' as const, label: 'Zoom In' },
  { value: 'grayscale-to-color' as const, label: 'Grayscale\u2192Color' },
];

export function ImageInspector({
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
      {/* Image Source */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Image URL</label>
          <input
            type="text"
            value={element.url || ''}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Alt Text</label>
          <input
            type="text"
            value={element.alt || ''}
            onChange={(e) => update({ alt: e.target.value })}
            placeholder="Describe the image"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
          />
        </div>
      </div>

      {/* Display */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Object Fit</label>
          <div className="grid grid-cols-4 gap-1.5">
            {OBJECT_FITS.map((of) => (
              <button
                key={of.value}
                onClick={() => update({ objectFit: of.value })}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                  (element.objectFit || 'cover') === of.value
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {of.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Border Radius</label>
          <input
            type="text"
            value={element.borderRadius || '16px'}
            onChange={(e) => update({ borderRadius: e.target.value })}
            placeholder="e.g., 16px, 9999px"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">
            Opacity: {Math.round((element.opacity ?? 1) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round((element.opacity ?? 1) * 100)}
            onChange={(e) => update({ opacity: parseInt(e.target.value) / 100 })}
            className="w-full h-1 accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Aspect Ratio</label>
          <div className="grid grid-cols-4 gap-1.5">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.value}
                onClick={() => update(ar.value ? { aspectRatio: ar.value } : {})}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                  (element.aspectRatio || '') === ar.value
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Effects */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">
            Brightness: {element.filterBrightness ?? 100}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={element.filterBrightness ?? 100}
            onChange={(e) => update({ filterBrightness: parseInt(e.target.value) })}
            className="w-full h-1 accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">
            Contrast: {element.filterContrast ?? 100}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={element.filterContrast ?? 100}
            onChange={(e) => update({ filterContrast: parseInt(e.target.value) })}
            className="w-full h-1 accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">
            Saturation: {element.filterSaturation ?? 100}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={element.filterSaturation ?? 100}
            onChange={(e) => update({ filterSaturation: parseInt(e.target.value) })}
            className="w-full h-1 accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">
            Blur: {element.filterBlur ?? 0}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={element.filterBlur ?? 0}
            onChange={(e) => update({ filterBlur: parseInt(e.target.value) })}
            className="w-full h-1 accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Hover Effect</label>
          <div className="grid grid-cols-3 gap-1.5">
            {HOVER_EFFECTS.map((fx) => (
              <button
                key={fx.value}
                onClick={() => update({ hoverEffect: fx.value })}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                  (element.hoverEffect || 'none') === fx.value
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {fx.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Linking */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Link URL</label>
          <input
            type="text"
            value={element.linkUrl || ''}
            onChange={(e) => update({ linkUrl: e.target.value })}
            placeholder="https://... (click through)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
          />
        </div>

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

      {/* Caption */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Caption</label>
        <input
          type="text"
          value={element.caption || ''}
          onChange={(e) => update({ caption: e.target.value })}
          placeholder="Image caption text"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
        />
      </div>
    </div>
  );
}
