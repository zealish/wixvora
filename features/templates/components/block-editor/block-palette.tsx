"use client";

import { BLOCK_CATALOG } from "../../lib/block-catalog";
import type { BlockCatalogItem } from "../../lib/block-catalog";
import { getBlockIcon } from "../../lib/block-icons";

interface BlockPaletteProps {
  onAddBlock: (item: BlockCatalogItem) => void;
}

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {BLOCK_CATALOG.map((cat) => (
        <div key={cat.category} className="space-y-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                  className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 text-left group transition shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white flex items-center justify-center transition shrink-0">
                    <Icon className="w-4 h-4" />
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
