"use client";

import { useEditor } from "../editor-provider";
import { BLOCK_CATALOG } from "../lib/block-definitions";
import { Icon } from "../ui/icon-library";
import type { IconName } from "../ui/icon-library";

export function BlockPalette() {
  const { addBlock, gridEnabled, setGridEnabled } = useEditor();

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2">
        <div className="flex items-center gap-2">
          <Icon name="grid" size={16} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Show Grid</span>
        </div>
        <button
          onClick={() => setGridEnabled(!gridEnabled)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            gridEnabled ? "bg-blue-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              gridEnabled ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {BLOCK_CATALOG.map((category) => (
        <div key={category.category} className="mb-4">
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {category.category}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {category.items.map((item) => (
              <button
                key={item.type}
                onClick={() => addBlock(item.type)}
                className="group flex flex-col items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center transition-all hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                  <Icon name={item.icon as IconName} size={20} />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-700">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400">{item.type}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
