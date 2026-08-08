"use client";

import { Eye, EyeOff, ArrowUp, ArrowDown, Trash2, Layers } from "lucide-react";
import type { BlockConfig } from "../../lib/block-types";

interface LayerTreeProps {
  blocks: BlockConfig[];
  selectedBlockId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDelete: (id: string) => void;
}

export function LayerTree({
  blocks,
  selectedBlockId,
  onSelect,
  onToggleVisibility,
  onMove,
  onDelete,
}: LayerTreeProps) {
  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-4">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>Layer Tree ({blocks.length})</span>
        <span className="text-[10px] text-slate-500">Click to edit</span>
      </div>
      {blocks.map((b, idx) => (
        <div
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs transition ${
            b.id === selectedBlockId
              ? "border-blue-500 bg-blue-600/20 font-medium text-white"
              : "border-slate-800 bg-slate-950/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="w-4 text-[10px] text-slate-500">{idx + 1}.</span>
            <Layers className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <span className="truncate font-medium capitalize">
              {b.props.layerName || b.type}
            </span>
          </div>
          <div className="flex shrink-0 items-center space-x-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(b.id);
              }}
              title={b.hidden ? "Show" : "Hide"}
              className="p-1 text-slate-500 hover:text-white"
            >
              {b.hidden ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(b.id, "up");
              }}
              title="Move up"
              className="p-1 text-slate-500 hover:text-white"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(b.id, "down");
              }}
              title="Move down"
              className="p-1 text-slate-500 hover:text-white"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(b.id);
              }}
              title="Delete"
              className="p-1 text-slate-500 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
