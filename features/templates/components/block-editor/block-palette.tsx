"use client";

import { BLOCK_CATALOG } from "../../lib/block-catalog";
import type { BlockCatalogItem } from "../../lib/block-catalog";
import { getBlockIcon } from "../../lib/block-icons";

interface BlockPaletteProps {
  onAddBlock: (item: BlockCatalogItem) => void;
}

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-4">
      {BLOCK_CATALOG.map((cat) => (
        <div key={cat.category} className="space-y-3">
          <h3 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {cat.category}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {cat.items.map((item) => {
              const Icon = getBlockIcon(item.icon);
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onAddBlock(item)}
                  className="group flex items-center space-x-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left shadow-sm transition hover:border-blue-500/50 hover:bg-slate-800/80"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Click to insert a layer
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
