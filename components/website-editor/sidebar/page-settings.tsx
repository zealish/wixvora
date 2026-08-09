"use client";

import { useEditor } from "../editor-provider";

export function PageSettings() {
  const { pageSettings, updatePageSettings } = useEditor();

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Judul Halaman
          </label>
          <input
            type="text"
            value={pageSettings.title}
            onChange={(e) => updatePageSettings({ title: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:bg-white"
            placeholder="Judul halaman"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Warna Latar Belakang
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={pageSettings.bgColor}
              onChange={(e) => updatePageSettings({ bgColor: e.target.value })}
              className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-slate-200"
            />
            <input
              type="text"
              value={pageSettings.bgColor}
              onChange={(e) => updatePageSettings({ bgColor: e.target.value })}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:bg-white"
              placeholder="#ffffff"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Font Family
          </label>
          <select
            value={pageSettings.fontFamily}
            onChange={(e) => updatePageSettings({ fontFamily: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:bg-white"
          >
            <option value="font-sans">Sans-serif (Default)</option>
            <option value="font-poppins">Poppins</option>
            <option value="font-serif">Serif</option>
            <option value="font-mono">Monospace</option>
          </select>
        </div>
      </div>
    </div>
  );
}
