"use client";

import type { Element } from "../lib/block-types";
import { parseVideoUrl } from "../lib/video-url-parser";

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
] as const;

export function VideoInspector({
  element,
  sectionId,
  onUpdate,
}: {
  element: Element;
  sectionId: string;
  onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void;
}) {
  const update = (props: Partial<Element>) => onUpdate(sectionId, element.id, props);
  const parsed = parseVideoUrl(element.videoUrl || '');

  return (
    <div className="space-y-4">
      {/* Video URL */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Video URL</label>
        <input
          type="text"
          value={element.videoUrl || ''}
          onChange={(e) => {
            const newParsed = parseVideoUrl(e.target.value);
            update({
              videoUrl: e.target.value,
              videoProvider: newParsed?.provider || null,
            });
          }}
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
        />
        {parsed && (
          <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold rounded-full bg-slate-100 text-slate-500">
            {parsed.provider === 'youtube' ? 'YouTube' : 'Vimeo'}
          </span>
        )}
        {!parsed && element.videoUrl && (
          <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold rounded-full bg-red-50 text-red-500">
            Invalid URL
          </span>
        )}
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Aspect Ratio</label>
        <div className="grid grid-cols-3 gap-1.5">
          {ASPECT_RATIOS.map((ar) => (
            <button
              key={ar.value}
              onClick={() => update({ aspectRatio: ar.value })}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                (element.aspectRatio || '16:9') === ar.value
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {ar.label}
            </button>
          ))}
        </div>
      </div>

      {/* Autoplay */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Autoplay</label>
        <input
          type="checkbox"
          checked={!!element.autoplay}
          onChange={(e) => update({ autoplay: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
        />
      </div>

      {/* Loop */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Loop</label>
        <input
          type="checkbox"
          checked={!!element.loop}
          onChange={(e) => update({ loop: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
        />
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

      {/* Background Color */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Background</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={element.bgColor || '#000000'}
            onChange={(e) => update({ bgColor: e.target.value })}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
          />
          <span className="font-mono text-[11px] text-slate-600">{element.bgColor}</span>
        </div>
      </div>
    </div>
  );
}
