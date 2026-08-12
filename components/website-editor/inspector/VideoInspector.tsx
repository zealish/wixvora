"use client";

import Image from "next/image";
import type { Element } from "../lib/block-types";
import { parseVideoUrl } from "../lib/video-url-parser";

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
] as const;

const PLAY_STYLES = [
  { value: 'circle' as const, label: 'Circle', icon: '⚪' },
  { value: 'square' as const, label: 'Square', icon: '⬜' },
  { value: 'minimal' as const, label: 'Minimal', icon: '▶' },
];

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

      {/* Thumbnail URL */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Custom Thumbnail</label>
        <input
          type="text"
          value={element.thumbnailUrl || ''}
          onChange={(e) => update({ thumbnailUrl: e.target.value })}
          placeholder="https://... (leave empty for auto-fetch)"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
        />
        {element.thumbnailUrl && (
          <div className="mt-1 rounded-lg overflow-hidden border border-slate-200">
            <Image
              src={element.thumbnailUrl}
              alt="Thumbnail preview"
              width={200}
              height={60}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '60px' }}
              unoptimized
            />
          </div>
        )}
        {!element.thumbnailUrl && parsed && (
          <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold rounded-full bg-blue-50 text-blue-500">
            Auto: {parsed.provider === 'youtube' ? 'YouTube thumbnail' : 'Vimeo thumbnail'}
          </span>
        )}
      </div>

      {/* Play Button Style */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Play Button Style</label>
        <div className="grid grid-cols-3 gap-1.5">
          {PLAY_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => update({ playButtonStyle: style.value })}
              className={`px-2 py-2 rounded-lg text-center transition border ${
                (element.playButtonStyle || 'circle') === style.value
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-lg">{style.icon}</div>
              <div className="text-[9px] font-semibold mt-0.5">{style.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay Color */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Overlay</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={element.overlayColor?.startsWith('rgba') ? '#000000' : (element.overlayColor || '#000000')}
            onChange={(e) => update({ overlayColor: e.target.value + '4D' })}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
          />
          <span className="font-mono text-[11px] text-slate-600">{element.overlayColor || 'rgba(0,0,0,0.3)'}</span>
        </div>
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

      {/* Muted */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Muted</label>
        <input
          type="checkbox"
          checked={element.muted ?? false}
          onChange={(e) => update({ muted: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
        />
      </div>

      {/* Show Controls */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Show Controls</label>
        <input
          type="checkbox"
          checked={element.showControls !== false}
          onChange={(e) => update({ showControls: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
        />
      </div>

      {/* Control Bar Theme */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Control Bar Theme</label>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { value: 'dark' as const, label: 'Dark' },
            { value: 'light' as const, label: 'Light' },
          ]).map((t) => (
            <button
              key={t.value}
              onClick={() => update({ controlBarTheme: t.value })}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                (element.controlBarTheme || 'dark') === t.value
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
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
