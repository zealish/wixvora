"use client";

import type { PageSettings } from "../../lib/block-types";

interface PageSettingsPanelProps {
  pageSettings: PageSettings;
  onChange: (patch: Partial<PageSettings>) => void;
}

export function PageSettingsPanel({ pageSettings, onChange }: PageSettingsPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
      <div className="space-y-1.5">
        <label className="font-semibold text-slate-300">Page Title</label>
        <input
          type="text"
          value={pageSettings.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-blue-500 outline-none"
        />
      </div>
      <div className="space-y-1.5">
        <label className="font-semibold text-slate-300">Canvas Background Color</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={pageSettings.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
            className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
          />
          <input
            type="text"
            value={pageSettings.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="font-semibold text-slate-300">Main Page Font</label>
        <select
          value={pageSettings.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-blue-500 outline-none"
        >
          <option value="font-sans">Plus Jakarta Sans / Inter</option>
          <option value="font-serif">Playfair Display (Serif Classic)</option>
          <option value="font-mono">Fira Code (Developer Mono)</option>
        </select>
      </div>
    </div>
  );
}
